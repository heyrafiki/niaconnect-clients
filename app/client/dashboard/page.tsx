"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [onboardingComplete, setOnboardingComplete] = useState<null | boolean>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      setLoading(false)
      return
    }
    const fetchClient = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/clients/${session.user.id}`)
        if (!res.ok) throw new Error("Failed to fetch client profile")
        const data = await res.json()
        setOnboardingComplete(data?.client?.onboarding?.completed === true)
      } catch (e: any) {
        setError(e.message || "Failed to load client profile")
      } finally {
        setLoading(false)
      }
    }
    fetchClient()
  }, [status, session?.user?.id])

  useEffect(() => {
    if (!loading && onboardingComplete === false) {
      router.replace("/onboarding/step-1")
    }
  }, [loading, onboardingComplete, router])

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }
  if (onboardingComplete === false) {
    // Redirect handled above
    return null
  }

  type UserSession = { first_name?: string; firstName?: string; name?: string }
  const user = session?.user as UserSession
  let displayName = user && (user.first_name || user.firstName || "")

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Welcome to your Dashboard, {displayName}!</h1>
      <p className="text-sm text-gray-600">
        This is your client dashboard. Here you can manage your sessions, appointments, and personal information.
      </p>
    </div>
  )
}
