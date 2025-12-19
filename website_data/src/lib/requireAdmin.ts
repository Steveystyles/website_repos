import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/auth"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return session
}
