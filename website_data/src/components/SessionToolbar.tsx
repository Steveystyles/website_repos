import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/auth"
import { LogoutButton } from "@/components/LogoutButton"

export async function SessionToolbar() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return (
    <div
      style={{
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 14, color: "#475569" }}>
          Signed in as{" "}
          <span style={{ fontWeight: 600, color: "#0f172a" }}>
            {session.user.email}
          </span>
        </div>
        <LogoutButton />
      </div>
    </div>
  )
}
