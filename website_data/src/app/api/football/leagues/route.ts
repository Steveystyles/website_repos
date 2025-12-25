import { fetchApiFootball } from "@/lib/footballApi"

type ApiFootballLeague = {
  league: {
    id: number
    name: string
    type: string
  }
  seasons?: {
    year?: number
    current?: boolean
  }[]
}

export async function GET() {
  try {
    const data = await fetchApiFootball<ApiFootballLeague[]>("/leagues", {
      current: true,
    })

    const leagues = (data.response ?? [])
      // Only keep league competitions that have an active season.
      .filter((entry) => entry.league?.type?.toLowerCase() === "league")
      .map((entry) => {
        const currentSeason =
          entry.seasons?.find((s) => s.current) ??
          entry.seasons?.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))[0]

        return {
          id: String(entry.league.id),
          name: entry.league.name,
          season: currentSeason?.year ? String(currentSeason.year) : String(new Date().getFullYear()),
        }
      })
      // Deduplicate (API can return multiple records per league).
      .reduce<{ seen: Set<string>; leagues: { id: string; name: string; season: string }[] }>(
        (acc, league) => {
          if (!acc.seen.has(league.id)) {
            acc.seen.add(league.id)
            acc.leagues.push(league)
          }
          return acc
        },
        { seen: new Set(), leagues: [] }
      ).leagues

    return Response.json(leagues)
  } catch (error) {
    console.error("Failed to fetch leagues from API-Football", error)
    return Response.json([], { status: 500 })
  }
}
