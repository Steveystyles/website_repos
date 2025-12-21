"use client"

import { signOut } from "next-auth/react"

export function LogoutButton() {
  const callbackUrl =
    typeof window === "undefined" ||
    !window.location.origin ||
    window.location.origin === "null"
      ? "/login"
      : `${window.location.origin}/login`

  return (
    <button
      type="button"
      onClick={() =>
        signOut({
          callbackUrl,
        })
      }
      style={{
        borderRadius: 999,
        border: "1px solid #cbd5f5",
        background: "#ffffff",
        padding: "8px 16px",
        fontSize: 14,
        fontWeight: 600,
        color: "#1d4ed8",
        cursor: "pointer",
      }}
      aria-label="Log out of your account"
    >
      Log out
    </button>
  )
}
