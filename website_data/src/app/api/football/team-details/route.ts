import { fetchApiFootball, safeDate } from "@/lib/footballApi"

type ApiFootballTeam = {
  team?: {
    id?: number
    name?: string
    logo?: string | null
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

async function fetchTeamProfile(teamId: string) {
  const data = await fetchApiFootball<ApiFootballTeam[]>("/teams", { id: teamId })
  const team = data.response?.[0]?.team

  return {
    teamName: team?.name ?? "Unknown team",
    crest: team?.logo ?? null,
  }
}

async function fetchManager(teamId: string, season: string | null) {
  if (!season) return "Unavailable"

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

async function fetchNextMatch(teamId: string): Promise<TeamDetails["nextMatch"] | null> {
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
}

async function fetchLeaguePosition(
  leagueId: string | null,
  season: string | null,
  teamId: string
) {
  if (!leagueId || !season) return null

  const data = await fetchApiFootball<ApiFootballStandingsResponse[]>("/standings", {
    league: leagueId,
    season,
  })

  const standings = data.response?.[0]?.league?.standings?.[0] ?? []
  const row = standings.find((entry) => String(entry.team?.id ?? "") === teamId)

  return row?.rank ?? null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get("teamId")
  const leagueId = searchParams.get("leagueId")
  const season = searchParams.get("season")

  if (!teamId) {
    return Response.json({ error: "teamId is required" }, { status: 400 })
  }

  try {
    const [profile, manager, nextMatch, leaguePosition] = await Promise.all([
      fetchTeamProfile(teamId),
      fetchManager(teamId, season),
      fetchNextMatch(teamId),
      fetchLeaguePosition(leagueId, season, teamId),
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
