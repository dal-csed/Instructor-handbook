"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { name: "Home", href: "/" },
  { name: "Onboarding", href: "/onboarding" },
  { name: "Educational posters and infographics", href: "/services" },
  { name: "Syllabus Generator", href: "/syllabus" },
  { name: "Resources", href: "/resources" },
  { name: "Contact", href: "/contact" },
]

export default function TabNavigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-[#242424]">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "px-2 font-semibold mr-3 py-2 transition-colors relative",
                  isActive
                    ? "text-white rounded-t-xs bg-[#242424]"
                    : "text-gray-600 hover:text-[#474646] hover:bg-gray-50",
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
