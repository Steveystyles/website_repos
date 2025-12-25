"use client"

import { OutputKey } from "./DashboardClient"
import { lightHaptic } from "@/lib/haptics"
import type { ReactNode } from "react"


type Props = {
  active: OutputKey
  onChange: (key: OutputKey) => void
}

const TABS: { key: OutputKey; label: string }[] = [
  { key: "one", label: "Football" },
  { key: "two", label: "Watchlist" },
  { key: "three", label: "Players" },
  { key: "four", label: "Settings" },
]

/**
 * Inline SVG icons (no libraries)
 */
const ICONS: Record<OutputKey, ReactNode> = {
  one: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 9.5l9-7 9 7V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  two: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  three: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="9" cy="7" r="4" />
      <circle cx="17" cy="7" r="4" />
      <path d="M2 21c0-4 4-7 7-7s7 3 7 7" />
    </svg>
  ),
  four: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a7.5 7.5 0 0 0 .1-6l2-1.2-2-3.4-2.3 1a7.7 7.7 0 0 0-5.2-3V1h-4v2.4a7.7 7.7 0 0 0-5.2 3l-2.3-1-2 3.4 2 1.2a7.5 7.5 0 0 0 0 6l-2 1.2 2 3.4 2.3-1a7.7 7.7 0 0 0 5.2 3V23h4v-2.4a7.7 7.7 0 0 0 5.2-3l2.3 1 2-3.4z" />
    </svg>
  ),
}

export default function BottomTabs({ active, onChange }: Props) {
  const activeIndex = TABS.findIndex((t) => t.key === active)

  return (
    <nav className="relative h-[64px] bg-smfc-black border-t border-smfc-grey overflow-visible">
      {/* Sliding red indicator */}
      <div
        className="
          absolute
          bottom-[6px]
          left-0
          h-[3px]
          w-1/4
          bg-smfc-red
          z-10
          transition-transform
          duration-300
          ease-out
        "
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      <ul className="grid h-full grid-cols-4">
        {TABS.map((tab) => {
          const isActive = tab.key === active

          return (
            <li key={tab.key}>
              <button
                type="button"
                onClick={() => {
                  lightHaptic()
                  onChange(tab.key)
                }}
                className={`
                  group
                  flex h-full w-full flex-col items-center justify-center gap-1
                  text-xs font-semibold
                  transition-all duration-200
                  active:scale-95
                  ${isActive ? "text-smfc-white" : "text-neutral-500"}
                `}
              >
                <div
                  className={`
                    transition-all duration-300
                    ${isActive
                      ? "scale-110 drop-shadow-[0_0_6px_rgba(200,16,46,0.7)]"
                      : "scale-100"}
                  `}
                >
                  {ICONS[tab.key]}
                </div>
                <span className="text-[10px]">{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
