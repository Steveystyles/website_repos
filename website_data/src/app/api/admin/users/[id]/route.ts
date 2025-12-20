import { NextRequest, NextResponse } from "next/server"
import type { RouteHandler } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/requireAdmin"

export const PUT: RouteHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin()

  const { id } = await params
  const body = await req.json()

  await prisma.user.update({
    where: { id },
    data: body,
  })

  return NextResponse.json({ success: true })
}

export const DELETE: RouteHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin()

  const { id } = await params

  await prisma.user.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
