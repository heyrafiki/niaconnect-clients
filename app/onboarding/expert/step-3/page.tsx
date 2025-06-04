"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import ExpertStepNavigation from "@/components/onboarding/expert-step-navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const sessionTypeOptions = ["Online Sessions", "In-person Sessions", "Hybrid Sessions"]
const preferredTimeOptions = ["Morning Hours", "Afternoon", "Evening Hours", "Night Hours"]

export default function ExpertSessionPreferencesStep() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [sessionRate, setSessionRate] = useState("")
  const [sessionTypes, setSessionTypes] = useState<string[]>([])
  const [preferredTimes, setPreferredTimes] = useState<string[]>([])

  // Redirect if not authenticated or not an expert
  useEffect(() => {
    if (!isLoading && (!user || user.userType !== "expert")) {
      router.push("/auth/practitioner")
    }
  }, [user, isLoading, router])

  const handleSessionTypeToggle = (type: string) => {
    setSessionTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleTimeToggle = (time: string) => {
    setPreferredTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]))
  }

  const handleComplete = () => {
    // In a real app, you would save all the onboarding data here
    // and mark the expert as onboarded in your database

    // For now, we'll just redirect to the expert dashboard
    router.push("/dashboard/expert")
  }

  if (isLoading || !user || user.userType !== "expert") {
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
      <div className="text-gray-400 font-secondary font-medium text-right mb-4">STEP 3 OF 3</div>
      <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-heyrafiki-green" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Session Preferences</h1>
            </div>

            {/* Session Rate */}
            <div className="space-y-2">
              <Label htmlFor="sessionRate" className="text-gray-700 font-secondary font-medium text-sm">
                How much do you charge per session (in KES)?
              </Label>
              <Input
                id="sessionRate"
                placeholder="Please enter your session rates"
                value={sessionRate}
                onChange={(e) => setSessionRate(e.target.value)}
                className="border-gray-300 focus:border-heyrafiki-green focus:ring-heyrafiki-green rounded-xl h-12 font-secondary max-w-md bg-[#f5f5f5]"
              />
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
                    onClick={() => handleSessionTypeToggle(option)}
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
                What time would you like to have your therapy sessions? (Select all that apply)
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                {preferredTimeOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={preferredTimes.includes(option) ? "default" : "outline"}
                    onClick={() => handleTimeToggle(option)}
                    className={`h-12 rounded-xl font-secondary ${
                      preferredTimes.includes(option)
                        ? "bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-[#f5f5f5]"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <ExpertStepNavigation currentStep={3} totalSteps={3} onComplete={handleComplete} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
