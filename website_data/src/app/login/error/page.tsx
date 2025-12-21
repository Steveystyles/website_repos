"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

const errorMessages: Record<string, string> = {
  CredentialsSignin: "User not found or password incorrect.",
}

export default function LoginErrorPage() {
  const searchParams = useSearchParams()
  const errorKey = searchParams.get("error") ?? undefined
  const message = errorKey
    ? errorMessages[errorKey] ?? "Unable to sign in. Please try again."
    : "Unable to sign in. Please try again."

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.2),_transparent_50%)]" />

      <div className="relative w-full max-w-lg">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-rose-300/80">
              Sign-in failed
            </p>
            <h1 className="text-3xl font-semibold text-white">
              We couldn&apos;t verify your account
            </h1>
            <p className="text-sm text-slate-300">{message}</p>
          </div>

          <div className="mt-8">
            <Link
              href="/login"
              className="block rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110"
            >
              Back to login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Need help? Contact support for account access.
        </div>
      </div>
    </div>
  )
}
