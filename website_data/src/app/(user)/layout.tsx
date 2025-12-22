import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth/auth"

export default async function UserLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect("/login")

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {children}
    </main>
  )
}
