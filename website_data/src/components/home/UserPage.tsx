import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth/auth"
import UserShell from "@/components/home/UserShell"

type TitleResolver = string | ((userEmail: string) => string)

type UserPageProps = {
  title: TitleResolver
  description?: string
  eyebrow?: string
  children: ReactNode
}

export default async function UserPage({
  title,
  description,
  eyebrow,
  children,
}: UserPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userEmail = session.user?.email ?? "User"
  const resolvedTitle = typeof title === "function" ? title(userEmail) : title

  return (
    <UserShell
      userEmail={userEmail}
      title={resolvedTitle}
      description={description}
      eyebrow={eyebrow}
    >
      {children}
    </UserShell>
  )
}
