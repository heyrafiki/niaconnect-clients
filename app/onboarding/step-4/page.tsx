"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import StepNavigation from "@/components/onboarding/step-navigation"

export default function MentalHealthScaleStep() {
  const [mentalHealthScale, setMentalHealthScale] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const { data: session, status } = useSession();
  const router = useRouter()

  // Restore mental health scale from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("onboarding_step4");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.mentalHealthScale !== undefined && data.mentalHealthScale !== null) {
          setMentalHealthScale(data.mentalHealthScale);
        }
      } catch {}
    }
  }, []);

  // Save mental health scale to localStorage on change
  useEffect(() => {
    if (mentalHealthScale !== null) {
      localStorage.setItem("onboarding_step4", JSON.stringify({ mentalHealthScale }));
    }
  }, [mentalHealthScale]);

  // Gather all onboarding data from localStorage/session
  const getOnboardingData = () => {
    // Step 1
    let step1 = {};
    const saved1 = localStorage.getItem("onboarding_step1");
    if (saved1) {
      try {
        const { data } = JSON.parse(saved1);
        step1 = data || {};
      } catch {}
    }
    // Step 2
    let step2 = {};
    const saved2 = localStorage.getItem("onboarding_step2");
    if (saved2) {
      try {
        step2 = JSON.parse(saved2) || {};
      } catch {}
    }
    // Step 3
    let step3 = {};
    const saved3 = localStorage.getItem("onboarding_step3");
    if (saved3) {
      try {
        step3 = JSON.parse(saved3) || {};
      } catch {}
    }
    // Step 4 (mentalHealthScale)
    let step4 = { mental_health_scale: mentalHealthScale };
    return { ...step1, ...step2, ...step3, ...step4 };
  };


  const handleComplete = async () => {
    setLoading(true);
    setError("");
    try {
      if (!session?.user) {
        setError("You must be signed in to complete onboarding. Please sign in and try again.");
        setLoading(false);
        return;
      }
      const data = getOnboardingData();
      console.debug("Submitting onboarding data:", data);
      const res = await fetch("/api/update-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to complete onboarding");
        setLoading(false);
        return;
      }
      // Clear onboarding state
      localStorage.removeItem("onboarding_step1");
      localStorage.removeItem("onboarding_step2");
      localStorage.removeItem("onboarding_step3");
      localStorage.removeItem("onboarding_step4");
      router.push("/client/dashboard");
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
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

            <StepNavigation
  currentStep={4}
  totalSteps={4}
  onComplete={handleComplete}
  disableNext={
    !mentalHealthScale || loading
  }
/>
{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
