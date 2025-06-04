import { redirect } from "next/navigation"

export default function ExpertOnboardingIndex() {
  // Redirect to the first step
  redirect("/onboarding/expert/step-1")
}
