"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Resources", href: "/resources" },
  { name: "Contact", href: "/contact" },
]

export default function TabNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-100 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-[#474646] bg-white border-t-2 border-[#ffcc00]"
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
