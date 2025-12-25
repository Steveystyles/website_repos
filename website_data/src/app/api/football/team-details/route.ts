import { NextResponse } from "next/server"

type TeamResponse = {
  teamName: string
  manager: string
  leaguePosition: number
  nextMatch: {
    opponent: string
    date: string
    homeAway: "H" | "A"
  }
}

const DATA: Record<string, TeamResponse> = {
  "st-mirren": {
    teamName: "St Mirren",
    manager: "Stephen Robinson",
    leaguePosition: 6,
    nextMatch: {
      opponent: "Celtic",
      date: "2025-01-02",
      homeAway: "H",
    },
  },
  celtic: {
    teamName: "Celtic",
    manager: "Brendan Rodgers",
    leaguePosition: 1,
    nextMatch: {
      opponent: "Rangers",
      date: "2025-01-02",
      homeAway: "A",
    },
  },
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get("teamId")

  if (!teamId || !DATA[teamId]) {
    return NextResponse.json(null, { status: 404 })
  }

  return NextResponse.json(DATA[teamId])
}
