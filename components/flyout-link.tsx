"use client"

import { AnimatePresence, motion } from "framer-motion"
import { type ReactNode, useState } from "react"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

type FlyoutLinkProps = {
  children: ReactNode
  href: string
  FlyoutContent?: () => JSX.Element
}

export default function FlyoutLink({ children, href, FlyoutContent }: FlyoutLinkProps) {
  const [open, setOpen] = useState(false)

  const showFlyout = FlyoutContent && open

  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className="relative">
      <a href={href} className=" font-medium py-2 px-3 hover:border-b-2 hover:mb-[-2] hover:border-[#ffcc00]">
        {children}
      </a>
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            style={{ translateX: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 top-12 bg-white text-black"
          >
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const QRContent = () => {
  return (
    <div className="w-64 bg-white p-6 shadow-xl">
      <div className="mb-3 space-y-3">
        <h3 className="font-semibold">Feedback</h3>
        <p className="text-sm">We'd love to hear your thoughts! Scan the QR code to provide feedback.</p>
      </div>
    </div>
  )
}

export const PricingContent = () => {
  return (
    <div className="w-64 bg-white p-6 shadow-xl">
      <div className="mb-3 space-y-3">
        <h3 className="font-semibold">Pricing</h3>
        <p className="text-sm">Find the perfect plan for your needs.</p>
      </div>
    </div>
  )
}
