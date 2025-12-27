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

type League = {
  id: string
  name: string
  season: string
}

const FALLBACK_LEAGUES: League[] = [
  { id: "4399", name: "Scottish Premiership", season: "2024-2025" },
  { id: "4328", name: "English Premier League", season: "2024-2025" },
  { id: "4331", name: "German Bundesliga", season: "2024-2025" },
  { id: "4332", name: "Italian Serie A", season: "2024-2025" },
  { id: "4334", name: "French Ligue 1", season: "2024-2025" },
  { id: "4335", name: "Spanish La Liga", season: "2024-2025" },
]

function normalizeLeagues(data: SportsDbLeaguesResponse): League[] {
  return (data.leagues ?? [])
    .filter((league) => league.strSport?.toLowerCase() === "soccer")
    .map((league) => ({
      id: String(league.idLeague ?? ""),
      name: league.strLeague?.trim() || "Unknown league",
      season: league.strCurrentSeason?.trim() || String(new Date().getFullYear()),
    }))
    .filter((league) => league.id && league.name)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function GET() {
  try {
    const data = await fetchSportsDb<SportsDbLeaguesResponse>("/all_leagues.php", {
      s: "Soccer",
    })

    const leagues = normalizeLeagues(data)

    return Response.json(leagues.length > 0 ? leagues : FALLBACK_LEAGUES)
  } catch (error) {
    console.error("Failed to fetch leagues from TheSportsDB", error)
    return Response.json(FALLBACK_LEAGUES, { status: 200 })
  }
}
