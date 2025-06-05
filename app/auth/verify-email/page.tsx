'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the email from search params (for users coming from login)
  const email = searchParams.get('email')

  useEffect(() => {
    if (user?.isOnboarded) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleResendEmail = async () => {
    try {
      setIsResending(true)
      setError(null)
      setResendSuccess(false)

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email!,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (resendError) throw resendError

      setResendSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0">
          <img 
            src="/images/girl-hero.webp" 
            alt="Happy woman using phone" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Right Panel - Verify Email */}
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
              Check Your Email
            </CardTitle>
            <CardDescription className="text-gray-600 font-secondary text-sm">
              We've sent you an email with a verification link. Please click the link to verify your email address and continue to onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-sm text-gray-600">
              <p>Didn't receive the email?</p>
              <Button
                variant="link"
                className="text-heyrafiki-green hover:text-heyrafiki-green-dark"
                onClick={handleResendEmail}
                disabled={isResending || !email}
              >
                {isResending ? 'Sending...' : 'Click here to resend'}
              </Button>
              {resendSuccess && (
                <p className="mt-2 text-sm text-green-600">
                  Verification email has been resent!
                </p>
              )}
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/auth')}
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 