"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

export interface AccordionItem {
  id: string | number
  title: string
  content: React.ReactNode
}

interface BasicAccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  className?: string
  defaultExpandedIds?: Array<string | number>
}

export default function BasicAccordion({
  items,
  allowMultiple = false,
  className = "",
  defaultExpandedIds = [],
}: BasicAccordionProps) {
  const [expandedItems, setExpandedItems] =
    useState<Array<string | number>>(defaultExpandedIds)

  const toggleItem = (id: string | number) => {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter((item) => item !== id))
    } else {
      if (allowMultiple) {
        setExpandedItems([...expandedItems, id])
      } else {
        setExpandedItems([id])
      }
    }
  }

  return (
    <div
      className={`flex w-full flex-col overflow-hidden space-y-3 ${className}`}
    >
      {items.map((item) => {
        const isExpanded = expandedItems.includes(item.id)

        return (
          <div key={item.id} className="overflow-hidden shadow-sm ">
            <button
              onClick={() => toggleItem(item.id)}
              className={`group flex w-full items-center rounded-xs justify-between gap-2 px-4 py-3 text-left transition-colors duration-200
                ${isExpanded
                  ? "bg-[#242424] text-[#FFFFFF]"
                  : "bg-[#FFFFFF] text-[#242424] hover:bg-[#FFD400] hover:text-[#242424]"
                }`}
              aria-expanded={isExpanded}
            >
              <h3 className="font-semibold tracking-wide">{item.title}</h3>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isExpanded ? "text-[#FFD400]" : "text-[#242424]"
                  }`}
                />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: {
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                        duration: 0.3,
                      },
                      opacity: { duration: 0.25 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.25 },
                      opacity: { duration: 0.15 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[#242424] bg-[#FFFFFF] px-4 py-3 text-[#242424]">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}