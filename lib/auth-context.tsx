"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "./supabase"
import { createClient } from '@supabase/supabase-js'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  isOnboarded: boolean
  role: 'client'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUser(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email_confirmed_at)
      
      if (event === 'SIGNED_IN') {
        if (session) {
          await fetchUser(session.user.id)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsLoading(false)
      } else if (event === 'USER_UPDATED') {
        if (session?.user.email_confirmed_at) {
          await fetchUser(session.user.id)
          router.push('/onboarding/step-1')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data.role !== 'client') {
        await supabase.auth.signOut()
        router.push('/auth/expert')
        return
      }

      setUser({
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        avatar: data.avatar_url,
        isOnboarded: data.is_onboarded,
        role: data.role
      })
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // 1. Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingProfile) {
        throw new Error('An account with this email already exists')
      }

      // 2. Create new auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'client'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.')
        }
        throw signUpError
      }
      
      if (!authData.user) throw new Error('No user data returned from signup')

      // 3. Create profile using server API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authData.user.id,
          email,
          firstName,
          lastName
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create profile')
      }

      // 4. Redirect to verification page
      router.push('/auth/verify-email')
    } catch (error: any) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          // Resend confirmation email
          await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          })
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
          return
        }
        throw error
      }

      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
        return
      }

      // Redirect based on onboarding status
      router.push(profileData.is_onboarded ? '/dashboard' : '/onboarding/step-1')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })

      if (error) throw error
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
