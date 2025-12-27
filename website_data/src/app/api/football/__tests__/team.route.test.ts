import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetchSportsDb = vi.fn()

vi.mock("@/lib/sportsDbApi", () => ({
  fetchSportsDb: (path: string, query: Record<string, unknown>) =>
    mockFetchSportsDb(path, query),
}))

describe("GET /api/football/team", () => {
  beforeEach(() => {
    mockFetchSportsDb.mockReset()
    vi.resetModules()
  })

  it("returns 400 when teamId is missing", async () => {
    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("teamId is required")
  })

  it("fetches complete team profile", async () => {
    const mockTeam = {
      teams: [
        {
          idTeam: "133604",
          strTeam: "Arsenal",
          strTeamBadge: "https://example.com/arsenal.png",
          strLeague: "English Premier League",
          idLeague: "4328",
          strManager: "Mikel Arteta",
          strCurrentSeason: "2024-2025",
        },
      ],
    }

    const mockNextEvent = {
      events: [
        {
          strEvent: "Arsenal vs Liverpool",
          strHomeTeam: "Arsenal",
          strAwayTeam: "Liverpool",
          dateEvent: "2025-01-15",
          idHomeTeam: "133604",
          idAwayTeam: "133602",
        },
      ],
    }

    const mockTable = {
      table: [
        {
          idTeam: "133604",
          intRank: "2",
        },
      ],
    }

    mockFetchSportsDb
      .mockResolvedValueOnce(mockTeam)
      .mockResolvedValueOnce(mockNextEvent)
      .mockResolvedValueOnce(mockTable)

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=133604")
    const response = await GET(request)
    const data = await response.json()

    expect(data).toMatchObject({
      teamId: "133604",
      teamName: "Arsenal",
      crest: "https://example.com/arsenal.png",
      leagueId: "4328",
      leagueName: "English Premier League",
      season: "2024-2025",
      manager: "Mikel Arteta",
      position: 2,
      nextMatch: {
        opponent: "Liverpool",
        date: "2025-01-15",
        homeAway: "H",
      },
    })
  })

  it("identifies home matches correctly", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ teams: [{ idTeam: "1", strTeam: "Team A" }] })
      .mockResolvedValueOnce({
        events: [
          {
            idHomeTeam: "1",
            idAwayTeam: "2",
            strHomeTeam: "Team A",
            strAwayTeam: "Team B",
            dateEvent: "2025-01-01",
          },
        ],
      })
      .mockResolvedValueOnce({ table: [] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.nextMatch?.homeAway).toBe("H")
    expect(data.nextMatch?.opponent).toBe("Team B")
  })

  it("identifies away matches correctly", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ teams: [{ idTeam: "2", strTeam: "Team B" }] })
      .mockResolvedValueOnce({
        events: [
          {
            idHomeTeam: "1",
            idAwayTeam: "2",
            strHomeTeam: "Team A",
            strAwayTeam: "Team B",
            dateEvent: "2025-01-01",
          },
        ],
      })
      .mockResolvedValueOnce({ table: [] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=2")
    const response = await GET(request)
    const data = await response.json()

    expect(data.nextMatch?.homeAway).toBe("A")
    expect(data.nextMatch?.opponent).toBe("Team A")
  })

  it("handles missing next event", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ teams: [{ idTeam: "1", strTeam: "Team" }] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ table: [] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.nextMatch).toBeNull()
  })

  it("handles lookup position failure", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({
        teams: [{
          idTeam: "1",
          strTeam: "Team",
          idLeague: "100",
          strCurrentSeason: "2024",
        }],
      })
      .mockResolvedValueOnce({ events: [] })
      .mockRejectedValueOnce(new Error("Table fetch failed"))

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.position).toBeNull()
  })

  it("uses fallback leagueId when team profile missing", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ teams: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ table: [{ idTeam: "1", intRank: "5" }] })

    const { GET } = await import("../team/route")
    const request = new Request(
      "http://localhost/api/football/team?teamId=1&leagueId=4328&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(mockFetchSportsDb).toHaveBeenCalledWith(
      "/lookuptable.php",
      expect.objectContaining({ l: "4328", s: "2024" })
    )
  })

  it("returns null position when leagueId missing", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ teams: [{ idTeam: "1", strTeam: "Team" }] })
      .mockResolvedValueOnce({ events: [] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.position).toBeNull()
  })

  it("returns null position when season missing", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({
        teams: [{ idTeam: "1", strTeam: "Team", idLeague: "100" }],
      })
      .mockResolvedValueOnce({ events: [] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.position).toBeNull()
  })

  it("defaults manager to Unavailable when missing", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ teams: [{ idTeam: "1", strTeam: "Team" }] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ table: [] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.manager).toBe("Unavailable")
  })

  it("defaults teamName to Unknown team when lookup fails", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ teams: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ table: [] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=999")
    const response = await GET(request)
    const data = await response.json()

    expect(data.teamName).toBe("Unknown team")
  })

  it("handles null opponent in next match", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ teams: [{ idTeam: "1", strTeam: "Team" }] })
      .mockResolvedValueOnce({
        events: [
          {
            idHomeTeam: "1",
            strHomeTeam: "Team",
            strAwayTeam: null,
            dateEvent: "2025-01-01",
          },
        ],
      })
      .mockResolvedValueOnce({ table: [] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.nextMatch?.opponent).toBe("TBD")
  })

  it("handles missing date in next match", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ teams: [{ idTeam: "1", strTeam: "Team" }] })
      .mockResolvedValueOnce({
        events: [
          {
            idHomeTeam: "1",
            strAwayTeam: "Opponent",
            dateEvent: null,
          },
        ],
      })
      .mockResolvedValueOnce({ table: [] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.nextMatch?.date).toBeDefined()
    // Should use current date as fallback
    expect(new Date(data.nextMatch!.date)).toBeInstanceOf(Date)
  })

  it("handles team not found in standings", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({
        teams: [{
          idTeam: "1",
          strTeam: "Team",
          idLeague: "100",
          strCurrentSeason: "2024",
        }],
      })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({
        table: [
          { idTeam: "2", intRank: "1" },
          { idTeam: "3", intRank: "2" },
        ],
      })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.position).toBeNull()
  })

  it("converts position string to number", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({
        teams: [{
          idTeam: "1",
          strTeam: "Team",
          idLeague: "100",
          strCurrentSeason: "2024",
        }],
      })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ table: [{ idTeam: "1", intRank: "7" }] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(typeof data.position).toBe("number")
    expect(data.position).toBe(7)
  })

  it("handles invalid position rank", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({
        teams: [{
          idTeam: "1",
          strTeam: "Team",
          idLeague: "100",
          strCurrentSeason: "2024",
        }],
      })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ table: [{ idTeam: "1", intRank: null }] })

    const { GET } = await import("../team/route")
    const request = new Request("http://localhost/api/football/team?teamId=1")
    const response = await GET(request)
    const data = await response.json()

    expect(data.position).toBeNull()
  })
})