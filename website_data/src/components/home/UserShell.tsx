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
  { href: "/?view=overview", label: "Overview" },
  { href: "/?view=reports", label: "Reports" },
  { href: "/?view=team", label: "Team" },
  { href: "/?view=settings", label: "Settings" },
]

export default function UserShell({
  userEmail,
  title,
  description,
  eyebrow = "User Home",
  children,
}: UserShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const currentTime = useMemo(() => new Date().toLocaleTimeString(), [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-700 text-slate-100 transition hover:border-slate-500 hover:text-white"
          >
            <span className="text-xl leading-none">☰</span>
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {eyebrow}
            </p>
            <p className="text-sm font-semibold text-slate-100">{title}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">
            {userEmail.slice(0, 2).toUpperCase()}
          </div>
        </div>

          {isMobileNavOpen ? (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
            />
          ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-900/95 shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:bg-slate-900/60 ${
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-4 lg:border-b-0">
            <button
              type="button"
                onClick={() => {
                  setIsCollapsed((prev) => !prev)
                  setIsMobileNavOpen(false)
                }}
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
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="Close navigation"
                className="text-sm text-slate-400 lg:hidden"
              >
                Close
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-3 pb-6 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
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

        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-8">
          <header className="flex flex-col gap-2 border-b border-slate-800 pb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
              {eyebrow}
            </p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              {title}
            </h1>
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
