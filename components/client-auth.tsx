"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function ClientAuth() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Auth context
  const { login, signup, isLoading } = useAuth()

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/onboarding/step-1",
        redirect: true,
      });
    } catch (error: any) {
      alert(error.message || "Google sign-in failed");
    }
  }

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSignUp) {
      // Validate passwords match
      if (password !== confirmPassword) {
        alert("Passwords don't match")
        return
      }

      // Sign up and redirect to verify OTP
      await signup(firstName, lastName, email, password)
    } else {
      // Login and redirect to dashboard
      await login(email, password)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Hero Image with Welcome Message (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/images/girl-hero.webp" alt="Happy woman using phone" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />

        {/* Welcome Message Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-white text-center max-w-lg">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">Welcome to Heyrafiki</h1>
            <h2 className="text-lg lg:text-xl font-semibold mb-3 font-secondary">
              Support That Feels Like It Gets You
            </h2>
            <p className="text-base lg:text-lg opacity-90 font-secondary leading-relaxed">
              Take charge of your mental well-being through culturally-informed therapy, peer support, and tools that
              adapt to your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 lg:p-8 h-screen overflow-y-auto">
        {/* Mobile Background */}
        <div className="absolute inset-0 lg:hidden">
          <Image src="/images/girl-hero.webp" alt="Happy woman using phone" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Auth Card */}
        <div className="relative z-10 w-full max-w-md">
          <Card className="backdrop-blur-xl bg-[#f3fcf8] border-2 border-[#36B37E]/20 shadow-2xl rounded-3xl">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/heyrafiki-logo.png"
                  alt="Heyrafiki Logo"
                  width={180}
                  height={72}
                  className="h-10 w-auto"
                />
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {isSignUp ? "Start Your Journey" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-gray-600 font-secondary text-sm">
                {isSignUp ? "Create your account to begin" : "Continue your wellness journey"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              {/* Google OAuth Button */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl py-3 font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                onClick={handleGoogleSignIn}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    fill="#4285F4"
                    d="M21.805 10.023h-9.18v3.955h5.44c-.235 1.249-1.422 3.667-5.44 3.667-3.275 0-5.95-2.713-5.95-6.045s2.675-6.045 5.95-6.045c1.864 0 3.12.797 3.838 1.48l2.626-2.556C17.06 2.91 14.77 2 12.001 2 6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 5.236 0 9.67-3.885 9.67-9.34 0-.627-.07-1.098-.165-1.637z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 font-secondary">Or continue with email</span>
                </div>
              </div>

              {/* Form Fields */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="firstName" className="text-gray-700 font-secondary font-medium text-sm">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Sarah"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={isSignUp}
                        className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-10 font-secondary text-sm bg-[#f5f5f5]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName" className="text-gray-700 font-secondary font-medium text-sm">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Johnson"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required={isSignUp}
                        className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-10 font-secondary text-sm bg-[#f5f5f5]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-gray-700 font-secondary font-medium text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-10 font-secondary text-sm bg-[#f5f5f5]"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-gray-700 font-secondary font-medium text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-10 pr-10 font-secondary text-sm bg-[#f5f5f5]"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-secondary font-medium text-sm">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={isSignUp}
                        className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-10 pr-10 font-secondary text-sm bg-[#f5f5f5]"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {!isSignUp && (
                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-heyrafiki-green hover:underline font-secondary">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white font-medium rounded-xl font-secondary text-sm"
                >
                  {isLoading ? "Processing..." : isSignUp ? "Begin Your Journey" : "Continue Journey"}
                </Button>
              </form>

              {/* Toggle Auth Mode */}
              <div className="text-center">
                <span className="text-gray-600 font-secondary text-sm">
                  {isSignUp ? "Already have an account?" : "New to Heyrafiki?"}
                </span>
                <button
                  onClick={toggleAuthMode}
                  className="ml-1 text-heyrafiki-green hover:underline font-medium font-secondary text-sm"
                >
                  {isSignUp ? "Sign In" : "Get Started"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
