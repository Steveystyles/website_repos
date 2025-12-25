import { fetchApiFootball } from "@/lib/footballApi"

type LeagueRow = {
  position: number
  teamId: string
  teamName: string
  won: number
  lost: number
  goalDifference: number
  points: number
  crest: string
}

type ApiFootballStanding = {
  rank?: number
  team?: {
    id?: number
    name?: string
    logo?: string
  }
  all?: {
    win?: number
    lose?: number
    goals?: {
      for?: number
      against?: number
    }
  }
  goalsDiff?: number
  points?: number
}

type ApiFootballStandingsResponse = {
  league?: {
    name?: string
    standings?: ApiFootballStanding[][]
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const leagueId = searchParams.get("leagueId")
  const season = searchParams.get("season")

  if (!leagueId || !season) {
    return Response.json({ rows: [], leagueName: "" }, { status: 400 })
  }

  try {
    const data = await fetchApiFootball<ApiFootballStandingsResponse[]>("/standings", {
      league: leagueId,
      season,
    })

    const league = data.response?.[0]?.league
    const standings = league?.standings?.[0] ?? []

    const rows: LeagueRow[] = standings.map((entry) => ({
      position: entry.rank ?? 0,
      teamId: String(entry.team?.id ?? ""),
      teamName: entry.team?.name ?? "Unknown",
      won: entry.all?.win ?? 0,
      lost: entry.all?.lose ?? 0,
      goalDifference: entry.goalsDiff ?? 0,
      points: entry.points ?? 0,
      crest: entry.team?.logo ?? "",
    }))

    return Response.json({
      rows,
      leagueName: league?.name ?? "",
    })
  } catch (error) {
    console.error("Failed to fetch standings from API-Football", error)
    return Response.json({ rows: [], leagueName: "" }, { status: 500 })
  }
}
