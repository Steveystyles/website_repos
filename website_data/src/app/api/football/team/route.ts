import { fetchSportsDb } from "@/lib/sportsDbApi"

type SportsDbTeam = {
  idTeam?: string | null
  strTeam?: string | null
  strTeamBadge?: string | null
  strLeague?: string | null
  idLeague?: string | null
  strManager?: string | null
  strCurrentSeason?: string | null
}

type SportsDbTeamResponse = {
  teams?: SportsDbTeam[]
}

type SportsDbEvent = {
  strEvent?: string | null
  strHomeTeam?: string | null
  strAwayTeam?: string | null
  dateEvent?: string | null
  strVenue?: string | null
  idHomeTeam?: string | null
  idAwayTeam?: string | null
}

type SportsDbEventsResponse = {
  events?: SportsDbEvent[]
}

type SportsDbTableRow = {
  idTeam?: string | null
  intRank?: string | null
}

type SportsDbTableResponse = {
  table?: SportsDbTableRow[]
}

type TeamProfile = {
  teamId: string
  teamName: string
  crest?: string | null
  leagueId?: string | null
  leagueName?: string | null
  season?: string | null
  manager?: string | null
  position?: number | null
  nextMatch?: {
    opponent: string
    date: string
    homeAway: "H" | "A"
  } | null
}

function toNumber(value?: string | number | null) {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

async function lookupTeam(teamId: string): Promise<SportsDbTeam | null> {
  try {
    const data = await fetchSportsDb<SportsDbTeamResponse>("/lookupteam.php", { id: teamId })
    return data.teams?.[0] ?? null
  } catch (error) {
    console.error("lookupteam failed", error)
    return null
  }
}

async function fetchNextEvent(teamId: string): Promise<TeamProfile["nextMatch"]> {
  try {
    const data = await fetchSportsDb<SportsDbEventsResponse>("/eventsnext.php", { id: teamId })
    const match = data.events?.[0]
    if (!match) return null

    const isHome = String(match.idHomeTeam ?? "") === String(teamId)
    const opponent = isHome ? match.strAwayTeam : match.strHomeTeam
    return {
      opponent: opponent ?? "TBD",
      date: match.dateEvent ?? new Date().toISOString(),
      homeAway: isHome ? "H" : "A",
    }
  } catch (error) {
    console.error("eventsnext failed", error)
    return null
  }
}

async function lookupPosition(
  teamId: string,
  leagueId: string | null,
  season: string | null
): Promise<number | null> {
  if (!leagueId || !season) return null

  try {
    const table = await fetchSportsDb<SportsDbTableResponse>("/lookuptable.php", {
      l: leagueId,
      s: season,
    })

    const row = table.table?.find((entry) => String(entry.idTeam ?? "") === String(teamId))
    return row?.intRank ? toNumber(row.intRank) : null
  } catch (error) {
    console.error("lookuptable failed", error)
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get("teamId")
  const fallbackLeagueId = searchParams.get("leagueId")
  const fallbackSeason = searchParams.get("season")

  if (!teamId) {
    return Response.json({ error: "teamId is required" }, { status: 400 })
  }

  const profile = await lookupTeam(teamId)

  const leagueId = profile?.idLeague ?? fallbackLeagueId ?? null
  const leagueName = profile?.strLeague ?? null
  const season = profile?.strCurrentSeason ?? fallbackSeason ?? null

  const [nextMatch, position] = await Promise.all([
    fetchNextEvent(teamId),
    lookupPosition(teamId, leagueId, season),
  ])

  const response: TeamProfile = {
    teamId,
    teamName: profile?.strTeam ?? "Unknown team",
    crest: profile?.strTeamBadge ?? null,
    leagueId,
    leagueName,
    season,
    manager: profile?.strManager ?? "Unavailable",
    position,
    nextMatch,
  }

  return Response.json(response)
}
