"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Home, User, MessageCircle, Calendar, BookOpen, Users, FileText, CreditCard, BarChart2, Zap, Settings, LogOut, Menu } from "lucide-react"

const links = [
  { name: "Home", icon: Home, href: "/client/dashboard" },
  { name: "Therapists", icon: Users, href: "/client/experts" },
  { name: "Messages", icon: MessageCircle, href: "#" },
  { name: "Calendar", icon: Calendar, href: "/client/calendar" },
  { name: "Sessions", icon: BookOpen, href: "/client/sessions" },
  { name: "Journal", icon: FileText, href: "#" },
  { name: "Resources", icon: BookOpen, href: "#" },
  { name: "Billing", icon: CreditCard, href: "#" },
  { name: "Analytics", icon: BarChart2, href: "#" },
  { name: "Community", icon: Users, href: "#" },
  { name: "Integrations", icon: Zap, href: "#" },
  { name: "Settings", icon: Settings, href: "#" },
]

export default function ClientSidebar({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed z-50 top-0 left-0 min-h-[100vh] h-full w-64 bg-white shadow-lg transform transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:block",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full py-6 px-4 border-r border-gray-200">
          <div className="mb-8 flex items-center justify-center">
            <img src="/images/heyrafiki-logo.png" alt="Heyrafiki Logo" className="h-10 w-auto" />
          </div>
          <nav className="flex-1 space-y-2 overflow-y-auto lg:overflow-y-visible">
            {links.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-heyrafiki-green/10 transition-colors text-sm lg:text-base"
                onClick={onClose}
              >
                <link.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <button className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-heyrafiki-green/10 w-full text-sm lg:text-base">
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
} 