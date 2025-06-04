"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import StepNavigation from "@/components/onboarding/step-navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const sessionTypeOptions = ["Online Sessions", "In-person Sessions", "Hybrid Sessions"]
const preferredTimeOptions = ["Morning Hours", "Afternoon", "Evening Hours", "Night Hours"]

export default function SessionPreferencesStep() {
  const [sessionTypes, setSessionTypes] = useState<string[]>([])
  const [preferredTime, setPreferredTime] = useState<string>("")
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/client")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-heyrafiki-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="text-gray-400 font-secondary font-medium text-right mb-4">STEP 3 OF 4</div>
      <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-heyrafiki-green" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Session Preferences</h1>
                <p className="text-gray-600 font-secondary mt-2 text-sm">Select the timings that work well for you</p>
              </div>
            </div>

            {/* Session Type */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 font-secondary">
                How would you like to have your therapy sessions? (Select all that apply)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {sessionTypeOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={sessionTypes.includes(option) ? "default" : "outline"}
                    onClick={() => {
                      setSessionTypes((prev) =>
                        prev.includes(option) ? prev.filter((type) => type !== option) : [...prev, option],
                      )
                    }}
                    className={`h-12 rounded-xl font-secondary ${
                      sessionTypes.includes(option)
                        ? "bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-[#f5f5f5]"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preferred Time */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 font-secondary">
                What time would you like to have your therapy sessions?
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                {preferredTimeOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={preferredTime === option ? "default" : "outline"}
                    onClick={() => setPreferredTime(option)}
                    className={`h-12 rounded-xl font-secondary ${
                      preferredTime === option
                        ? "bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-[#f5f5f5]"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <StepNavigation currentStep={3} totalSteps={4} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
