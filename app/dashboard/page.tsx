"use client"

import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth")
    }
  }, [session, status, router])

  if (status === "loading" || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-heyrafiki-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Image src="/images/heyrafiki-logo.png" alt="Heyrafiki Logo" width={140} height={56} className="h-8 w-auto" />
          <Button onClick={() => signOut({ callbackUrl: "/auth" })} variant="outline" className="text-heyrafiki-green border-heyrafiki-green">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Welcome to your Dashboard, {session.user.first_name || session.user.firstName}!</h1>
          <p className="text-sm text-gray-600">
            This is your client dashboard. Here you can view your upcoming appointments, access resources, track your progress, and connect with your support network.
          </p>
        </div>
      </main>
    </div>
  )
}
