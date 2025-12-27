import { fetchSportsDb } from "@/lib/sportsDbApi"

type SportsDbLeague = {
  idLeague?: string | null
  strLeague?: string | null
  strSport?: string | null
  strCurrentSeason?: string | null
}

type SportsDbLeaguesResponse = {
  leagues?: SportsDbLeague[]
}

type SportsDbTeam = {
  idTeam?: string | null
  strTeam?: string | null
  strTeamBadge?: string | null
  idLeague?: string | null
  strLeague?: string | null
}

type SportsDbTeamResponse = {
  teams?: SportsDbTeam[]
}

function normalizeLeagues(data: SportsDbLeaguesResponse, query: string) {
  const match = query.trim().toLowerCase()
  return (data.leagues ?? [])
    .filter((league) => league.strSport?.toLowerCase() === "soccer")
    .filter((league) => !match || league.strLeague?.toLowerCase().includes(match))
    .map((league) => ({
      id: String(league.idLeague ?? ""),
      name: league.strLeague?.trim() || "Unknown league",
      season: league.strCurrentSeason?.trim() || String(new Date().getFullYear()),
    }))
    .filter((league) => league.id && league.name)
    .slice(0, 8)
}

function normalizeTeams(data: SportsDbTeamResponse) {
  return (data.teams ?? [])
    .map((team) => ({
      id: String(team.idTeam ?? ""),
      name: team.strTeam ?? "Unknown",
      badge: team.strTeamBadge ?? null,
      leagueId: team.idLeague ?? null,
      leagueName: team.strLeague ?? null,
      kind: "team" as const,
    }))
    .filter((team) => team.id && team.name)
    .slice(0, 12)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")?.trim() ?? ""

  if (!query) {
    return Response.json({ leagues: [], teams: [] })
  }

  try {
    const [leagueData, teamData] = await Promise.all([
      fetchSportsDb<SportsDbLeaguesResponse>("/all_leagues.php", { s: "Soccer" }),
      fetchSportsDb<SportsDbTeamResponse>("/searchteams.php", { t: query }),
    ])

    return Response.json({
      leagues: normalizeLeagues(leagueData, query),
      teams: normalizeTeams(teamData),
    })
  } catch (error) {
    console.error("Search failed for TheSportsDB v2", error)
    return Response.json({ leagues: [], teams: [] }, { status: 500 })
  }
}
