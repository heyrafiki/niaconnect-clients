"use client"

import { useSession } from "next-auth/react"

export default function Dashboard() {
  const { data: session } = useSession()
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
