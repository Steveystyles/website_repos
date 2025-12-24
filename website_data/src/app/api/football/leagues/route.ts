import { prisma } from "@/lib/prisma"

type SportsDbLeague = {
  idLeague: string
  strLeague: string
  strSport: string
  strCurrentSeason?: string | null
}

async function fetchSportsDbFallback(): Promise<
  { id: string; name: string; season: string }[]
> {
  try {
    const res = await fetch(
      "https://www.thesportsdb.com/api/v1/json/3/all_leagues.php",
      { cache: "no-store" }
    )

    if (!res.ok) return []

    const json = (await res.json()) as { leagues?: SportsDbLeague[] }
    const soccerLeagues = (json.leagues ?? []).filter(
      (league) => league.strSport === "Soccer"
    )

    return soccerLeagues.map((league) => ({
      id: league.idLeague,
      name: league.strLeague,
      season: league.strCurrentSeason ?? "2024-2025",
    }))
  } catch (error) {
    console.error("Failed to fetch leagues from TheSportsDB", error)
    return []
  }
}

export async function GET() {
  try {
    const leagues = await prisma.footballLeague.findMany({
      where: { source: "thesportsdb" },
      orderBy: { name: "asc" },
    })

    if (leagues.length > 0) {
      return Response.json(
        leagues.map((l) => ({
          id: l.id,
          name: l.name,
          season: "2024-2025",
        }))
      )
    }
  } catch (error) {
    console.error("Failed to read leagues from database", error)
  }

  // Fallback to TheSportsDB if the database is empty or unavailable
  const fallback = await fetchSportsDbFallback()
  return Response.json(fallback)
}
