import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth/auth"
import DashboardClient from "@/components/dashboard/DashboardClient"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return <DashboardClient />
}
