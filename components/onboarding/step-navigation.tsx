"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onComplete?: () => void
  disableNext?: boolean
}

export default function StepNavigation({ currentStep, totalSteps, onComplete, disableNext }: StepNavigationProps) {
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < totalSteps) {
      router.push(`/onboarding/step-${currentStep + 1}`)
    } else if (onComplete) {
      onComplete()
    } else {
      router.push("/client/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      router.push(`/onboarding/step-${currentStep - 1}`)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex justify-between items-center mt-8">
      <Button
        onClick={handleBack}
        variant="outline"
        disabled={currentStep === 1}
        className="border-heyrafiki-green text-heyrafiki-green hover:bg-whitesmoke hover:text-gray-900 rounded-xl font-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Button
        onClick={handleNext}
        disabled={disableNext}
        className="bg-heyrafiki-green hover:bg-heyrafiki-green/90 text-white rounded-xl font-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {currentStep === totalSteps ? "Finish" : "Next"}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}
