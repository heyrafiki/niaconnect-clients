'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function HeyrafikiLogo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-10 w-[120px] bg-transparent" aria-hidden="true" />
    )
  }

  return (
    <Image
      src={resolvedTheme === 'dark' 
        ? '/images/heyrafiki-dark-logo.png' 
        : '/images/heyrafiki-logo.png'}
      alt="Heyrafiki Logo"
      width={120}
      height={40}
      className="h-10 w-auto"
      priority
    />
  )
}