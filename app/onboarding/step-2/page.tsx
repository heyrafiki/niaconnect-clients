"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Puzzle } from "lucide-react"
import StepNavigation from "@/components/onboarding/step-navigation"

const therapyReasonOptions = [
  "I've been feeling depressed",
  "I feel anxious or overwhelmed",
  "My mood is interfering with my work/school life",
  "I struggle with building or maintaining relationships",
  "I can't find purpose and meaning in my life",
  "I want to gain self confidence",
  "I want to improve myself but I don't know where to start",
  "I am just exploring",
  "Other",
]

export default function TherapyReasonsStep() {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("onboarding_step2");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSelectedReasons(data.selectedReasons || []);
        // Force re-render in case of hydration issues
        // This is a workaround for some React/Next.js hydration bugs
        setTimeout(() => setSelectedReasons((prev) => [...prev]), 0);
      } catch {}
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("onboarding_step2", JSON.stringify({ selectedReasons }));
  }, [selectedReasons]);

  const handleReasonChange = (reason: string, checked: boolean) => {
    if (checked) {
      setSelectedReasons((prev) => [...prev, reason])
    } else {
      setSelectedReasons((prev) => prev.filter((r) => r !== reason))
    }
  }

  return (
    <>
      <div className="text-gray-400 font-secondary font-medium text-right mb-4">STEP 2 OF 4</div>
      <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <Puzzle className="w-6 h-6 text-heyrafiki-green" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">What led you to consider therapy today?</h1>
                <p className="text-gray-600 font-secondary mt-2 text-sm">Select all that apply</p>
              </div>
            </div>

            <div className="space-y-4">
              {therapyReasonOptions.map((reason) => (
                <div key={reason} className="flex items-center space-x-3">
                  <Checkbox
                    id={reason}
                    checked={selectedReasons.includes(reason)}
                    onCheckedChange={(checked) => handleReasonChange(reason, checked as boolean)}
                  />
                  <Label htmlFor={reason} className="text-gray-700 font-secondary font-medium text-sm">
                    {reason}
                  </Label>
                </div>
              ))}
            </div>

            <StepNavigation currentStep={2} totalSteps={4} disableNext={selectedReasons.length === 0} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
