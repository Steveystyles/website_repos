"use client"

import { useEffect, useState } from "react"
import { LogoutButton } from "@/components/LogoutButton"

type UserShellProps = {
  userEmail: string
  title: string
  description?: string
  eyebrow?: string
  children: React.ReactNode
}

export default function UserShell({
  userEmail,
  title,
  description,
  eyebrow = "User Home",
  children,
}: UserShellProps) {
  const [currentTime, setCurrentTime] = useState<string | null>(null)

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString())
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
          <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-lg sm:p-8">
            <header className="flex flex-col gap-4 border-b border-slate-800/80 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
                    {eyebrow}
                  </p>
                  <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                    {title}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-950/70 px-3 py-2 text-[0.7rem] text-slate-300 sm:text-xs">
                    <span className="font-semibold text-slate-200">
                      {userEmail}
                    </span>
                    {currentTime ? (
                      <>
                        <span className="text-slate-500">•</span>
                        <span>Last login: {currentTime}</span>
                      </>
                    ) : null}
                  </div>
                  <LogoutButton />
                </div>
              </div>
              {description ? (
                <p className="max-w-2xl text-sm text-slate-400">{description}</p>
              ) : null}
            </header>
            <div className="space-y-6">{children}</div>
          </section>
        </main>
      </div>
    </div>
  )
}
