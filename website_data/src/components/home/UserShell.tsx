"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

type UserShellProps = {
  userEmail: string
  title: string
  description?: string
  eyebrow?: string
  children: React.ReactNode
}

const navItems = [
  { href: "/placeholder-1", label: "Overview" },
  { href: "/placeholder-2", label: "Reports" },
  { href: "/placeholder-3", label: "Team" },
  { href: "/placeholder-4", label: "Settings" },
]

export default function UserShell({
  userEmail,
  title,
  description,
  eyebrow = "User Home",
  children,
}: UserShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const currentTime = useMemo(() => new Date().toLocaleTimeString(), [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={`flex flex-col border-r border-slate-800 bg-slate-900/60 transition-all duration-300 ${
            isCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="flex items-center justify-between gap-2 p-4">
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 text-slate-100 transition hover:border-slate-500 hover:text-white"
            >
              <span className="text-xl leading-none">☰</span>
            </button>
            {!isCollapsed && (
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Console
              </span>
            )}
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-2 pb-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-slate-200">
                  {item.label.slice(0, 2).toUpperCase()}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-800 px-4 py-4">
            {!isCollapsed ? (
              <div className="space-y-1 text-xs text-slate-400">
                <p className="font-semibold text-slate-200">{userEmail}</p>
                <p>Last login: {currentTime}</p>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">
                {userEmail.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 px-6 py-8 lg:px-10">
          <header className="flex flex-col gap-2 border-b border-slate-800 pb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            {description ? (
              <p className="max-w-2xl text-sm text-slate-400">{description}</p>
            ) : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}
