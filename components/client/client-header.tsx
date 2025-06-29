"use client"

import { useState } from "react"
import { Menu, ChevronDown, LogOut, User } from "lucide-react"
import ProfileAvatar from "@/components/client/ProfileAvatar"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import HeyrafikiLogo from "@/components/HeyrafikiLogo"
import { useIsMobile } from "@/hooks/use-mobile"


export default function ClientHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession()
  const user = session?.user || {};
  const displayName = user.first_name || user.name?.split(" ")[0] || "";
  const profileImgUrl = user.onboarding?.profile_img_url || undefined;
  const firstName = user.first_name || user.name?.split(" ")[0] || "";
  const lastName = user.last_name || user.name?.split(" ")[1] || "";
  const isMobile = useIsMobile();

  return (
    <header className="w-full bg-[var(--card-bg)] shadow-sm shadow-[var(--card-shadow)] px-4 py-3 flex items-center justify-between relative">
      {/* Hamburger (left) */}
      <div className="flex items-center gap-3 min-w-[2.5rem]">
        {isMobile && (
          <button onClick={onMenuClick} aria-label="Open sidebar">
            <Menu className="w-7 h-7 text-primary" />
          </button>
        )}
      </div>
      {/* Centered logo for mobile only (when sidebar is hidden by default) */}
      {isMobile && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/client/dashboard">
            <HeyrafikiLogo />
          </Link>
        </div>
      )}
      {/* Profile section */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Large screens: avatar, name, dropdown */}
        <div className="hidden lg:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted focus:outline-none">
                <ProfileAvatar profileImgUrl={profileImgUrl} firstName={firstName} lastName={lastName} size={40} />
                <span className="font-medium text-foreground/80 text-base">{displayName}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-semibold">{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/client/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth" })} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Mobile: avatar only, toggles dropdown */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <ProfileAvatar profileImgUrl={profileImgUrl} firstName={firstName} lastName={lastName} size={36} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-semibold">{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/client/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth" })} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
} 