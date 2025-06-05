"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/auth')
        return
      }

      try {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_onboarded')
          .eq('id', session.user.id)
          .single()

        if (profileError && !profileError.message.includes('not found')) {
          throw profileError
        }

        if (profile) {
          // Profile exists, redirect based on onboarding status
          router.push(profile.is_onboarded ? '/dashboard' : '/onboarding/step-1')
        } else {
          // Get user metadata
          const firstName = session.user.user_metadata.full_name?.split(' ')[0] || 
                          session.user.user_metadata.given_name || 
                          session.user.user_metadata.name?.split(' ')[0] || ''
          
          const lastName = session.user.user_metadata.full_name?.split(' ').slice(1).join(' ') || 
                         session.user.user_metadata.family_name || 
                         session.user.user_metadata.name?.split(' ').slice(1).join(' ') || ''

          // Create profile for new user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              first_name: firstName,
              last_name: lastName,
              role: 'client',
              is_onboarded: false,
              email_verified: true // Google OAuth users are pre-verified
            })

          if (insertError) {
            console.error('Error creating profile:', insertError)
            throw new Error(`Failed to create profile: ${insertError.message}`)
          }

          // Redirect to onboarding
          router.push('/onboarding/step-1')
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        // Redirect to auth page with error message
        router.push(`/auth?error=${encodeURIComponent(error.message)}`)
      }
    })
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Setting up your account...</h2>
        <p className="mt-2 text-sm text-gray-600">Please wait while we complete the process.</p>
      </div>
    </div>
  )
} 