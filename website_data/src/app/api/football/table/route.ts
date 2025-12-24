import { prisma } from "@/lib/prisma"

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const leagueId = searchParams.get("leagueId")
  const season = searchParams.get("season")

  // Use the supplied API key when available – TheSportsDB test key ("3")
  // only returns a subset of results which caused incomplete tables.
  const apiKey = process.env.THESPORTSDB_API_KEY ?? "123"

  if (!leagueId || !season) {
    return Response.json({ rows: [], leagueName: "" }, { status: 400 })
  }

  // optional: keep your existing LeagueStandings cache model, but it must be string/string
  // If your schema is number/number right now, we’ll fix it in the next step.
  // For now: NO CACHE (to get it working first)

  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${apiKey}/lookuptable.php?l=${leagueId}&s=${season}`,
    { cache: "no-store" }
  )

  if (!res.ok) return Response.json({ rows: [], leagueName: "" })

  const json = await res.json()
  const table = json?.table

  if (!Array.isArray(table) || table.length === 0) {
    return Response.json({ rows: [], leagueName: "" })
  }

  const rows: LeagueRow[] = table
    .map((r: any) => ({
      position: Number(r.intRank),
      teamId: String(r.idTeam),
      teamName: r.strTeam,
      won: Number(r.intWin),
      lost: Number(r.intLoss),
      goalDifference: Number(r.intGoalDifference),
      points: Number(r.intPoints),
      crest: r.strTeamBadge,
    }))
    // TheSportsDB occasionally returns rows out of order; enforce the correct ordering
    // so the UI grid is consistent with the official table.
    .sort((a, b) => a.position - b.position)

  const leagueName = table[0]?.strLeague ?? ""

  return Response.json({ rows, leagueName })
}
