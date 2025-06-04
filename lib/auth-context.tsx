"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id?: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  isOnboarded?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("heyrafiki_client_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Mock login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to your shared database
      const mockUser = {
        id: "client_" + Math.random().toString(36).substr(2, 9),
        firstName: "Demo",
        lastName: "Client",
        email: email,
        isOnboarded: true, // Existing users are already onboarded
      }

      setUser(mockUser)
      localStorage.setItem("heyrafiki_client_user", JSON.stringify(mockUser))
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mock signup function
  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to your shared database
      const newUser = {
        id: "client_" + Math.random().toString(36).substr(2, 9),
        firstName,
        lastName,
        email,
        isOnboarded: false, // New users need to complete onboarding
      }

      setUser(newUser)
      localStorage.setItem("heyrafiki_client_user", JSON.stringify(newUser))
      router.push("/onboarding/step-1")
    } catch (error) {
      console.error("Signup failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("heyrafiki_client_user")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
