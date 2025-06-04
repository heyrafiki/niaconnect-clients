import type React from "react"
import type { Metadata } from "next"
import { figtree, plusJakartaSans } from "@/lib/fonts"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Heyrafiki - Mental Health Support",
  description: "Culturally-informed therapy and wellness tools",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${plusJakartaSans.variable}`}>
      <body className={figtree.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
