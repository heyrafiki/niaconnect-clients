"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user && !session.user.onboarding?.completed) {
      router.replace("/onboarding/step-1")
    }
  }, [session, status, router])

  if (status === "loading" || (status === "authenticated" && session?.user && !session.user.onboarding?.completed)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  type UserSession = { first_name?: string; firstName?: string; name?: string }
  const user = session?.user as UserSession
  let displayName = user && (user.first_name || user.firstName || "")

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Welcome to your Dashboard, {displayName}!</h1>
      <p className="text-sm text-gray-600">
        This is your client dashboard. Here you can view your upcoming appointments, access resources, track your progress, and connect with your support network.
      </p>
    </div>
  )
}
