import { fetchApiFootball, safeDate } from "@/lib/footballApi"

type ApiFootballTeam = {
  team?: {
    id?: number
    name?: string
    logo?: string | null
  }
}

type ApiFootballLeague = {
  league?: {
    id?: number
    name?: string | null
  }
}

type ApiFootballCoach = {
  name?: string | null
}

type ApiFootballFixture = {
  fixture?: {
    date?: string | null
    venue?: { name?: string | null }
  }
  teams?: {
    home?: { id?: number; name?: string | null }
    away?: { id?: number; name?: string | null }
  }
}

type ApiFootballStanding = {
  rank?: number
  team?: {
    id?: number
  }
}

type ApiFootballStandingsResponse = {
  league?: {
    standings?: ApiFootballStanding[][]
  }
}

type TeamDetails = {
  teamName: string
  manager: string
  leaguePosition: number
  crest?: string | null
  nextMatch: {
    opponent: string
    date: string
    homeAway: "H" | "A"
  }
}

function normalizeSeason(season: string | null) {
  if (!season) return null
  const match = season.match(/\d{4}/)
  return match ? match[0] : null
}

async function fetchTeamProfile(teamId: string | null, teamName: string | null) {
  const query: Record<string, string> = {}
  if (teamId) query.id = teamId
  else if (teamName) query.search = teamName
  else return { teamName: "Unknown team", crest: null, id: null }

  let team: ApiFootballTeam["team"] | undefined

  try {
    const data = await fetchApiFootball<ApiFootballTeam[]>("/teams", query)
    team = data.response?.[0]?.team
  } catch {
    // Try fallback search by name below.
  }

  if (!team && teamName) {
    try {
      const byName = await fetchApiFootball<ApiFootballTeam[]>("/teams", { search: teamName })
      team = byName.response?.[0]?.team
    } catch {
      // ignore
    }
  }

  return {
    teamName: team?.name ?? teamName ?? "Unknown team",
    crest: team?.logo ?? null,
    id: team?.id ? String(team.id) : teamId,
  }
}

async function fetchManager(teamId: string | null, season: string | null) {
  if (!teamId || !season) return "Unavailable"

  try {
    const data = await fetchApiFootball<ApiFootballCoach[]>("/coachs", {
      team: teamId,
      season,
    })

    const coach = data.response?.find((c) => c?.name)?.name
    return coach ?? "Unavailable"
  } catch {
    return "Unavailable"
  }
}

async function fetchNextMatch(teamId: string | null): Promise<TeamDetails["nextMatch"] | null> {
  if (!teamId) return null

  try {
    const data = await fetchApiFootball<ApiFootballFixture[]>("/fixtures", {
      team: teamId,
      next: 1,
    })

    const fixture = data.response?.[0]
    if (!fixture?.fixture || !fixture.teams) return null

    const isHome = String(fixture.teams.home?.id ?? "") === teamId
    const opponent = isHome ? fixture.teams.away?.name : fixture.teams.home?.name
    const date = safeDate(fixture.fixture.date)?.toISOString() ?? new Date().toISOString()

    return {
      opponent: opponent ?? "TBD",
      date,
      homeAway: isHome ? "H" : "A",
    }
  } catch {
    return null
  }
}

async function fetchLeaguePosition(
  teamId: string | null,
  season: string | null,
  leagueId: string | null,
  leagueName: string | null
) {
  if (!teamId || !season) return null

  let targetLeagueId = leagueId

  if (leagueName) {
    try {
      const leagueSearch = await fetchApiFootball<ApiFootballLeague[]>("/leagues", {
        name: leagueName,
        current: true,
      })
      targetLeagueId = leagueSearch.response?.[0]?.league?.id
        ? String(leagueSearch.response[0].league?.id)
        : null
    } catch {
      targetLeagueId = targetLeagueId ?? null
    }
  }

  if (!targetLeagueId) return null

  try {
    const data = await fetchApiFootball<ApiFootballStandingsResponse[]>("/standings", {
      league: targetLeagueId,
      season,
    })

    const standings = data.response?.[0]?.league?.standings?.[0] ?? []
    const row = standings.find((entry) => String(entry.team?.id ?? "") === teamId)

    return row?.rank ?? null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get("teamId")
  const leagueId = searchParams.get("leagueId")
  const leagueName = searchParams.get("leagueName")
  const season = searchParams.get("season")
  const teamName = searchParams.get("teamName")

  if (!teamId && !teamName) {
    return Response.json({ error: "teamId or teamName is required" }, { status: 400 })
  }

  try {
    const normalizedSeason = normalizeSeason(season)
    const profile = await fetchTeamProfile(teamId, teamName)

    const [manager, nextMatch, leaguePosition] = await Promise.all([
      fetchManager(profile.id, normalizedSeason),
      fetchNextMatch(profile.id),
      fetchLeaguePosition(profile.id, normalizedSeason, leagueId, leagueName),
    ])

    const response: TeamDetails = {
      teamName: profile.teamName,
      manager,
      crest: profile.crest,
      leaguePosition: leaguePosition ?? 0,
      nextMatch:
        nextMatch ?? {
          opponent: "TBD",
          date: new Date().toISOString(),
          homeAway: "H",
        },
    }

    return Response.json(response)
  } catch (error) {
    console.error("Failed to fetch team details from API-Football", error)
    return Response.json(
      {
        teamName: "Unknown team",
        manager: "Unavailable",
        crest: null,
        leaguePosition: 0,
        nextMatch: {
          opponent: "TBD",
          date: new Date().toISOString(),
          homeAway: "H",
        },
      },
      { status: 500 }
    )
  }
}
