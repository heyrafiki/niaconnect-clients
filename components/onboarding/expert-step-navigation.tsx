"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ExpertStepNavigationProps {
  currentStep: number
  totalSteps: number
  onComplete?: () => void
}

export default function ExpertStepNavigation({ currentStep, totalSteps, onComplete }: ExpertStepNavigationProps) {
  const router = useRouter()

  const handlePrevious = () => {
    if (currentStep > 1) {
      router.push(`/onboarding/expert/step-${currentStep - 1}`)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      router.push(`/onboarding/expert/step-${currentStep + 1}`)
    } else if (onComplete) {
      onComplete()
    }
  }

  return (
    <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
      <Button
        type="button"
        variant="outline"
        onClick={handlePrevious}
        disabled={currentStep === 1}
        className="px-8 py-3 rounded-full font-secondary font-medium border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous Step
      </Button>

      <Button
        type="button"
        onClick={handleNext}
        className="px-8 py-3 rounded-full font-secondary font-medium bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white"
      >
        {currentStep === totalSteps ? "Done" : "Next Step"}
      </Button>
    </div>
  )
}
