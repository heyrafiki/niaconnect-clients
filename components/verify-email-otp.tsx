"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function VerifyEmailOTP() {
  const router = useRouter()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple digits
    if (value && !/^\d+$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current input is empty
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleResendOTP = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user.email) throw new Error("No email found")

      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })

      if (!response.ok) throw new Error("Failed to resend OTP")

      setCountdown(60) // Start 60-second countdown
      setError(null)
    } catch (error) {
      console.error("Error resending OTP:", error)
      setError("Failed to resend verification code. Please try again.")
    }
  }

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user.email) throw new Error("No email found")

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          otp: otpValue,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Verification failed")
      }

      // Redirect to onboarding
      router.push("/onboarding/step-1")
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setError(error instanceof Error ? error.message : "Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 lg:p-8 h-screen overflow-y-auto">
      <Card className="backdrop-blur-xl bg-white/90 border-white/30 shadow-2xl rounded-3xl border-2 w-full max-w-md">
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
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600 font-secondary text-sm">
            We've sent a 6-digit verification code to your email address. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input Grid */}
          <div className="grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-full h-12 text-center text-xl font-bold border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl bg-[#f5f5f5]"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            onClick={handleVerifyOTP}
            disabled={isVerifying || otp.some(d => !d)}
            className="w-full h-11 bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white rounded-xl font-secondary"
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>Didn't receive the code?</p>
            {countdown > 0 ? (
              <p className="text-gray-500">
                Resend code in {countdown} seconds
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-heyrafiki-green hover:underline font-medium"
              >
                Click here to resend
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 