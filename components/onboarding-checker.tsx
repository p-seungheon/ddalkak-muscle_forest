"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function OnboardingChecker() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip onboarding check if already on onboarding page
    if (pathname === "/onboarding") return

    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed")

    if (!hasCompletedOnboarding) {
      router.push("/onboarding")
    }
  }, [pathname, router])

  return null
}
