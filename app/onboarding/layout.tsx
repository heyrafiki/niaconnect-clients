"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
        
        {/* Futuristic Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
        </div>

        {/* Dynamic Shapes */}
        <div className="absolute top-0 left-0 w-full h-64 bg-primary/80 transform -skew-y-3 origin-top-left backdrop-blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/60 rounded-full transform translate-x-48 -translate-y-48 backdrop-blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/70 rounded-full transform translate-x-40 translate-y-40 backdrop-blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/images/heyrafiki-logo.png"
                alt="Heyrafiki Logo"
                width={180}
                height={72}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
