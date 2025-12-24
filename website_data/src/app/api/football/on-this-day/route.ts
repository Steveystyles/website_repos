import { NextResponse } from "next/server"

const HISTORY: Record<string, string[]> = {
  "st-mirren": [
    "1987 – Famous victory over Celtic at Love Street",
    "2013 – Secured promotion to the Premiership",
    "2021 – League Cup final appearance",
  ],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get("teamId")

  return NextResponse.json(HISTORY[teamId ?? ""] ?? [])
}
