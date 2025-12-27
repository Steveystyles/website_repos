import { fetchSportsDb } from "@/lib/sportsDbApi"

type LeagueRow = {
  position: number
  teamId: string
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  crest: string
}

type SportsDbTableRow = {
  idTeam?: string | null
  strTeam?: string | null
  strTeamBadge?: string | null
  strLeague?: string | null
  intRank?: string | null
  intPlayed?: string | null
  intWin?: string | null
  intDraw?: string | null
  intLoss?: string | null
  intGoalsFor?: string | null
  intGoalsAgainst?: string | null
  intGoalDifference?: string | null
  intPoints?: string | null
}

type SportsDbTableResponse = {
  table?: SportsDbTableRow[]
}

function toNumber(value?: string | number | null) {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const leagueId = searchParams.get("leagueId")
  const season = searchParams.get("season")

  if (!leagueId || !season) {
    return Response.json({ rows: [], leagueName: "" }, { status: 400 })
  }

  try {
    const data = await fetchSportsDb<SportsDbTableResponse>("/lookuptable.php", {
      l: leagueId,
      s: season,
    })

    const standings = data.table ?? []

    const rows: LeagueRow[] = standings
      .map((entry) => ({
        position: toNumber(entry.intRank),
        teamId: String(entry.idTeam ?? ""),
        teamName: entry.strTeam ?? "Unknown",
        played: toNumber(entry.intPlayed),
        won: toNumber(entry.intWin),
        drawn: toNumber(entry.intDraw),
        lost: toNumber(entry.intLoss),
        goalsFor: toNumber(entry.intGoalsFor),
        goalsAgainst: toNumber(entry.intGoalsAgainst),
        goalDifference: toNumber(entry.intGoalDifference),
        points: toNumber(entry.intPoints),
        crest: entry.strTeamBadge ?? "",
      }))
      .filter((entry) => entry.teamId && entry.teamName)

    return Response.json({
      rows,
      leagueName: standings?.[0]?.strLeague ?? "",
    })
  } catch (error) {
    console.error("Failed to fetch standings from TheSportsDB", error)
    return Response.json({ rows: [], leagueName: "" }, { status: 500 })
  }
}
