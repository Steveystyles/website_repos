import { NextResponse } from "next/server"

const LEAGUE_IDS: Record<string, string> = {
  "scottish-premiership": "179",
  "scottish-championship": "180",
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const league = searchParams.get("league") ?? "scottish-premiership"
    const season = searchParams.get("season") ?? "2024"

    const leagueId = LEAGUE_IDS[league]

    if (!leagueId) {
      return NextResponse.json({ rows: [] })
    }

    if (!process.env.API_FOOTBALL_KEY) {
      throw new Error("Missing API_FOOTBALL_KEY")
    }

    const res = await fetch(
      `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    )

    const json = await res.json()

    if (!json?.response || json.response.length === 0) {
      return NextResponse.json({
        leagueName: "Scottish Premiership",
        rows: [],
      })
    }

    const standings =
      json?.response?.[0]?.league?.standings?.[0] ?? []

    type StandingRow = {
      rank: number
      team: { id: number; name: string; logo: string }
      all: { win: number; lose: number }
      goalsDiff: number
      points: number
    }

    const rows = (standings as StandingRow[]).map((row) => ({
      position: row.rank,
      teamId: row.team.id.toString(),
      teamName: row.team.name,
      won: row.all.win,
      lost: row.all.lose,
      goalDifference: row.goalsDiff,
      points: row.points,
      crest: row.team.logo,
    }))

    return NextResponse.json({
      leagueName: json.response?.[0]?.league?.name ?? "",
      rows,
    })
  } catch (err) {
    console.error("League table error:", err)
    return NextResponse.json({ rows: [] }, { status: 500 })
  }
}
