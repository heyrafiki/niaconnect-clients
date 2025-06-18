"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import StepNavigation from "@/components/onboarding/step-navigation"

const sessionTypeOptions = ["Online Sessions", "In-person Sessions", "Hybrid Sessions"]
const preferredTimeOptions = ["Morning Hours", "Afternoon", "Evening Hours", "Night Hours"]

export default function SessionPreferencesStep() {
  const [sessionTypes, setSessionTypes] = useState<string[]>([])
  const [preferredTimes, setPreferredTimes] = useState<string[]>([])

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("onboarding_step3");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSessionTypes(data.sessionTypes || []);
        setPreferredTimes(data.preferredTimes || []);
      } catch {}
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("onboarding_step3", JSON.stringify({ sessionTypes, preferredTimes }));
  }, [sessionTypes, preferredTimes]);

  return (
    <>
      <div className="text-muted-foreground font-secondary font-medium text-right mb-4">STEP 3 OF 4</div>
      <Card className="bg-card shadow-xl rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">Session Preferences</h1>
                <p className="text-muted-foreground font-secondary mt-2 text-sm">Select the timings that work well for you</p>
              </div>
            </div>

            {/* Session Type */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground font-secondary">
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
                        ? "bg-primary hover:bg-primary-dark text-white"
                        : "border-border text-foreground hover:bg-muted bg-muted"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preferred Time */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground font-secondary">
                What time would you like to have your therapy sessions? (Select all that apply)
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                {preferredTimeOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={preferredTimes.includes(option) ? "default" : "outline"}
                    onClick={() => {
                      setPreferredTimes((prev) =>
                        prev.includes(option)
                          ? prev.filter((t) => t !== option)
                          : [...prev, option]
                      );
                    }}
                    className={`h-12 rounded-xl font-secondary ${
                      preferredTimes.includes(option)
                        ? "bg-primary hover:bg-primary-dark text-white"
                        : "border-border text-foreground hover:bg-muted bg-muted"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <StepNavigation currentStep={3} totalSteps={4} disableNext={sessionTypes.length === 0 || preferredTimes.length === 0} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
