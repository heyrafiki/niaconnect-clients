"use client"

import { useSession } from "next-auth/react"

export default function ProfilePage() {
  const { data: session } = useSession()
    type UserSession = { first_name?: string; firstName?: string; name?: string; email?: string }
    const user = session?.user as UserSession
    let displayName = user && (user.first_name || user.firstName || user.name || "")
    const email = user && (user.email || "")

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Profile</h1>
      <div className="mb-2"><span className="font-medium">Name:</span> {displayName}</div>
      <div className="mb-2"><span className="font-medium">Email:</span> {email}</div>
    </div>
  )
}
