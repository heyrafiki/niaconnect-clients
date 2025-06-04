import type React from "react"
import Image from "next/image"

export default function ExpertOnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-heyrafiki-green transform -skew-y-3 origin-top-left"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-heyrafiki-green rounded-full transform translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-heyrafiki-green rounded-full transform translate-x-40 translate-y-40"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Image
              src="/images/heyrafiki-logo.png"
              alt="Heyrafiki Logo"
              width={180}
              height={72}
              className="h-10 w-auto"
            />
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
