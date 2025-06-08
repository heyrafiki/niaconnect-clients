"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import StepNavigation from "@/components/onboarding/step-navigation"

export default function MentalHealthScaleStep() {
  const [mentalHealthScale, setMentalHealthScale] = useState<number | null>(null)
  const { user, isLoading } = useAuth()
  const router = useRouter()


  const handleComplete = () => {
    // In a real app, you would save all the onboarding data here
    // and mark the user as onboarded in your database
    router.push("/dashboard")
  }

  return (
    <>
      <div className="text-gray-400 font-secondary font-medium text-right mb-4">STEP 4 OF 4</div>
      <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <Smile className="w-6 h-6 text-heyrafiki-green" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">How are you doing?</h1>
                <p className="text-gray-600 font-secondary mt-2 text-sm">
                  On a scale of 1-10, where 1 = I am really struggling and 10 = I am totally okay, over the past month,
                  has your mental health interfered with your work life, social life or how you navigate your personal
                  life?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 py-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                <Button
                  key={number}
                  type="button"
                  variant={mentalHealthScale === number ? "default" : "outline"}
                  onClick={() => setMentalHealthScale(number)}
                  className={`w-16 h-16 rounded-xl font-secondary text-lg font-semibold ${
                    mentalHealthScale === number
                      ? "bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-[#f5f5f5]"
                  }`}
                >
                  {number}
                </Button>
              ))}
            </div>

            <StepNavigation currentStep={4} totalSteps={4} onComplete={handleComplete} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
