"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  useEffect(() => {
    const handleCallback = async () => {
      // Check for OAuth errors first
      if (error) {
        console.error('OAuth error details:', {
          error,
          errorDescription,
          searchParams: Object.fromEntries(searchParams.entries())
        })
        router.push(`/auth/error?message=${encodeURIComponent(errorDescription || 'Authentication failed')}`)
        return
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          router.push('/auth/error?message=Failed to get session')
          return
        }

        if (!session) {
          console.error('No session found')
          router.push('/auth')
          return
        }

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_onboarded')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') { // Not found error
          console.error('Profile check error:', profileError)
          router.push('/auth/error?message=Failed to check profile')
          return
        }

        if (profile) {
          // Profile exists, redirect based on onboarding status
          router.push(profile.is_onboarded ? '/dashboard' : '/onboarding/step-1')
          return
        }

        // Get user's name from Google metadata
        const firstName = session.user.user_metadata.full_name?.split(' ')[0] || ''
        const lastName = session.user.user_metadata.full_name?.split(' ').slice(1).join(' ') || ''

        // Create profile using server API
        const response = await fetch('/api/auth/google-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
            firstName,
            lastName
          })
        })

        const result = await response.json()
        
        if (!response.ok) {
          console.error('Profile creation error:', result)
          // If profile creation fails, clean up by signing out
          await supabase.auth.signOut()
          router.push('/auth/error?message=Failed to create profile')
          return
        }

        // Redirect to onboarding
        router.push('/onboarding/step-1')
      } catch (error: any) {
        console.error('Callback error:', error)
        router.push('/auth/error?message=Unexpected error occurred')
      }
    }

    handleCallback()
  }, [router, error, errorDescription])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Setting up your account...</h2>
        <p className="mt-2 text-sm text-gray-600">Please wait while we complete the process.</p>
      </div>
    </div>
  )
} 