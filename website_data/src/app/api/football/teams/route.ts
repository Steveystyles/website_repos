import { NextResponse } from "next/server"

const TEAMS: Record<string, { id: string; name: string }[]> = {
  "scot-prem": [
    { id: "st-mirren", name: "St Mirren" },
    { id: "celtic", name: "Celtic" },
    { id: "rangers", name: "Rangers" },
  ],
  "scot-champ": [
    { id: "dundee-utd", name: "Dundee United" },
    { id: "partick", name: "Partick Thistle" },
  ],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const leagueId = searchParams.get("leagueId")

  if (!leagueId || !TEAMS[leagueId]) {
    return NextResponse.json([])
  }

  return NextResponse.json(TEAMS[leagueId])
}
