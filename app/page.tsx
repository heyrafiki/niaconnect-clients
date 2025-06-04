import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-hidden">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/heyrafiki-logo.png"
            alt="Heyrafiki Logo"
            width={280}
            height={112}
            className="h-14 w-auto"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">Welcome to Heyrafiki</h1>
          <p className="text-base text-gray-600 font-secondary">Support That Feels Like It Gets You</p>
        </div>

        <div className="max-w-md mx-auto mt-8">
          <Link href="/auth">
            <Button className="w-full h-14 bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white font-medium rounded-2xl font-secondary">
              <div className="text-center">
                <div className="text-base font-semibold">Start Your Journey</div>
                <div className="text-sm opacity-90">Get the support you deserve</div>
              </div>
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 font-secondary mt-6">
          Take charge of your mental well-being through culturally-informed therapy, peer support, and tools that adapt
          to your journey.
        </p>
      </div>
    </div>
  )
}
