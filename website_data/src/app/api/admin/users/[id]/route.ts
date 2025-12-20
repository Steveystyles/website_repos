import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { role } = await req.json()

  if (!["USER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
  })

  return NextResponse.json({ id: user.id, role: user.role })
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { password } = await req.json()

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: params.id },
    data: { passwordHash },
  })

  return NextResponse.json({ success: true })
}
