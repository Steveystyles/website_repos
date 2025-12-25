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

export async function GET() {
  try {
    const data = await fetchSportsDb<SportsDbLeaguesResponse>("/search_all_leagues.php", {
      s: "Soccer",
    })

    const leagues = (data.leagues ?? [])
      .filter((league) => league.strSport?.toLowerCase() === "soccer")
      .map((league) => ({
        id: String(league.idLeague ?? ""),
        name: league.strLeague?.trim() || "Unknown league",
        season: league.strCurrentSeason?.trim() || String(new Date().getFullYear()),
      }))
      .filter((league) => league.id && league.name)
      .sort((a, b) => a.name.localeCompare(b.name))

    return Response.json(leagues)
  } catch (error) {
    console.error("Failed to fetch leagues from TheSportsDB", error)
    return Response.json([], { status: 500 })
  }
}
