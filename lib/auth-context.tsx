"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isOnboarded?: boolean;
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

  // No persistent login for now; session handled server-side
  useEffect(() => {
    setIsLoading(false);
  }, [])

  const login = async (email: string, password: string) => {
  setIsLoading(true)
  try {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === 'Email not verified. Please verify your email via OTP.') {
        router.push("/verify-otp?email=" + encodeURIComponent(email) + "&from=signin");
        return;
      }
      throw new Error(data.error || "Signin failed");
    }
    const user = data.user;
    setUser({
      id: user.id,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email,
      isOnboarded: user.onboarding?.completed || false
    });
    // Redirect logic
    if (!user.is_verified) {
      router.push("/verify-otp?email=" + encodeURIComponent(user.email) + "&from=signin");
    } else if (!user.onboarding?.completed) {
      router.push("/onboarding/step-1");
    } else {
      router.push("/dashboard");
    }
  } catch (error: any) {
    alert(error.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
}

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
  setIsLoading(true);
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    // User is not verified yet, redirect to OTP page
    setUser({
      id: data.user.id,
      firstName,
      lastName,
      email,
      isOnboarded: false
    });
    router.push("/verify-otp?email=" + encodeURIComponent(email) + "&from=signup");
  } catch (error: any) {
    alert(error.message || "Signup failed");
  } finally {
    setIsLoading(false);
  }
}

  const logout = () => {
    setUser(null);
    router.push("/");
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
