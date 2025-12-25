import { fetchApiFootball, safeDate } from "@/lib/footballApi"

type ApiFootballFixture = {
  fixture?: {
    date?: string | null
    venue?: { name?: string | null }
  }
  league?: {
    name?: string | null
    season?: number | null
  }
  teams?: {
    home?: { id?: number; name?: string | null }
    away?: { id?: number; name?: string | null }
  }
  goals?: {
    home?: number | null
    away?: number | null
  }
}

type ApiFootballTeam = {
  team?: {
    id?: number
  }
}

async function resolveTeamId(teamId: string | null, teamName: string | null) {
  if (teamId) {
    try {
      const byId = await fetchApiFootball<ApiFootballTeam[]>("/teams", { id: teamId })
      const resolved = byId.response?.[0]?.team?.id
      if (resolved) return String(resolved)
    } catch {
      // fall through to search
    }
  }

  if (teamName) {
    try {
      const byName = await fetchApiFootball<ApiFootballTeam[]>("/teams", { search: teamName })
      const resolved = byName.response?.[0]?.team?.id
      if (resolved) return String(resolved)
    } catch {
      // ignore
    }
  }

  return teamId
}

function formatScore(goals: number | null | undefined) {
  return Number.isFinite(goals) ? String(goals) : "?"
}

function buildFact(teamId: string, fixture: ApiFootballFixture) {
  const fixtureDate = safeDate(fixture.fixture?.date)
  const year = fixtureDate?.getFullYear()
  const venue = fixture.fixture?.venue?.name ?? "Unknown venue"
  const league = fixture.league?.name ?? "Unknown competition"

  const homeTeam = fixture.teams?.home?.name ?? "Home"
  const awayTeam = fixture.teams?.away?.name ?? "Away"
  const isHome = String(fixture.teams?.home?.id ?? "") === teamId

  const homeScore = formatScore(fixture.goals?.home ?? null)
  const awayScore = formatScore(fixture.goals?.away ?? null)

  const vs = `${homeTeam} ${homeScore} – ${awayScore} ${awayTeam}`
  const perspective = isHome ? "Home" : "Away"

  return `${year ?? "Unknown year"} – ${vs} (${league}, ${perspective}, ${venue})`
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get("teamId")
  const teamName = searchParams.get("teamName")

  if (!teamId && !teamName) {
    return Response.json([], { status: 400 })
  }

  const resolvedTeamId = await resolveTeamId(teamId, teamName)
  if (!resolvedTeamId) {
    return Response.json([], { status: 404 })
  }

  const today = new Date()
  const month = String(today.getUTCMonth() + 1).padStart(2, "0")
  const day = String(today.getUTCDate()).padStart(2, "0")

  // Look back across the last 10 seasons for fixtures played on this month/day.
  const years = Array.from({ length: 10 }).map(
    (_, idx) => today.getUTCFullYear() - idx
  )

  try {
    const requests = years.map((year) =>
      fetchApiFootball<ApiFootballFixture[]>("/fixtures", {
        team: resolvedTeamId,
        date: `${year}-${month}-${day}`,
      }).catch(() => ({ response: [] as ApiFootballFixture[] }))
    )

    const results = await Promise.all(requests)
    const fixtures = results.flatMap((r) => r.response ?? [])

    const facts = fixtures.map((fixture) =>
      buildFact(resolvedTeamId ?? teamId ?? "", fixture)
    )

    return Response.json(facts)
  } catch (error) {
    console.error("Failed to fetch On This Day history", error)
    return Response.json([], { status: 500 })
  }
}
