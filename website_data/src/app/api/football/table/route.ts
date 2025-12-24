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

type SportsDbTableRow = {
  intRank?: string | number
  idTeam?: string | number
  strTeam?: string
  intWin?: string | number
  intLoss?: string | number
  intGoalDifference?: string | number
  intPoints?: string | number
  strTeamBadge?: string
  strBadge?: string
  strLeague?: string
}

async function fetchTable(
  apiKey: string,
  leagueId: string,
  season: string
): Promise<{ rows: LeagueRow[]; leagueName: string }> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${apiKey}/lookuptable.php?l=${leagueId}&s=${season}`,
      { cache: "no-store" }
    )

    if (!res.ok) return { rows: [], leagueName: "" }

    const json = await res.json()
    const table = json?.table as SportsDbTableRow[] | undefined

    if (!Array.isArray(table) || table.length === 0) {
      return { rows: [], leagueName: "" }
    }

    const rows: LeagueRow[] = table
      .map((r) => ({
        position: Number(r.intRank ?? 0),
        teamId: String(r.idTeam ?? ""),
        teamName: r.strTeam ?? "",
        won: Number(r.intWin ?? 0),
        lost: Number(r.intLoss ?? 0),
        goalDifference: Number(r.intGoalDifference ?? 0),
        points: Number(r.intPoints ?? 0),
        crest: (r.strTeamBadge ?? r.strBadge ?? "").replace(
          /^http:\/\//,
          "https://"
        ),
      }))
      // TheSportsDB occasionally returns rows out of order; enforce the correct ordering
      // so the UI grid is consistent with the official table.
      .sort((a, b) => a.position - b.position)

    const leagueName = table[0]?.strLeague ?? ""
    return { rows, leagueName }
  } catch (error) {
    console.error("Failed to fetch table from TheSportsDB", error)
    return { rows: [], leagueName: "" }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const leagueId = searchParams.get("leagueId")
  const season = searchParams.get("season")

  if (!leagueId || !season) {
    return Response.json({ rows: [], leagueName: "" }, { status: 400 })
  }

  const suppliedKey = process.env.THESPORTSDB_API_KEY?.trim() || ""
  const defaultKey = "123"
  const fallbackKey = "3"

  const keys = [defaultKey, suppliedKey, fallbackKey]
  const seen = new Set<string>()

  let best = { rows: [], leagueName: "" }
  let bestKey = ""

  for (const key of keys) {
    if (!key || seen.has(key)) continue
    seen.add(key)

    const result = await fetchTable(key, leagueId, season)

    const hasMoreRows = result.rows.length > best.rows.length
    const prefersDefault =
      result.rows.length === best.rows.length && key === defaultKey && bestKey !== defaultKey

    if (hasMoreRows || prefersDefault) {
      best = result
      bestKey = key
    }
  }

  return Response.json(best)
}
