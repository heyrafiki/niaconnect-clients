import { redirect } from "next/navigation"

export default function OnboardingIndex() {
  // Redirect to the first step
  redirect("/onboarding/step-1")
}
