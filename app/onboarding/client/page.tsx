import { redirect } from "next/navigation"

export default function ClientOnboardingIndex() {
  // Redirect to the first step
  redirect("/onboarding/client/step-1")
}
