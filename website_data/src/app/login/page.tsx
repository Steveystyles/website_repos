"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.2),_transparent_50%)]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-sky-300/80">
              Welcome back
            </p>
            <h1 className="text-3xl font-semibold text-white">Sign in to your account</h1>
            <p className="text-sm text-slate-300">
              Use your admin or user credentials to continue.
            </p>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={async (e) => {
              e.preventDefault()
              await signIn("credentials", {
                email,
                password,
                callbackUrl: "/",
              })
            }}
          >
            <label className="block space-y-2 text-sm font-medium text-slate-200">
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-400 shadow-inner shadow-black/20 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-200">
              Password
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-400 shadow-inner shadow-black/20 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              Login
            </button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="h-px w-10 bg-white/10" />
          Secure access for admins and users
          <span className="h-px w-10 bg-white/10" />
        </div>
      </div>
    </div>
  )
}
