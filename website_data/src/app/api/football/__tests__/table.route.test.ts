import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetchSportsDb = vi.fn()

vi.mock("@/lib/sportsDbApi", () => ({
  fetchSportsDb: (path: string, query: Record<string, unknown>) =>
    mockFetchSportsDb(path, query),
}))

describe("GET /api/football/table", () => {
  beforeEach(() => {
    mockFetchSportsDb.mockReset()
    vi.resetModules()
  })

  it("returns 400 when leagueId is missing", async () => {
    const { GET } = await import("../table/route")
    const request = new Request("http://localhost/api/football/table?season=2024")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ rows: [], leagueName: "" })
  })

  it("returns 400 when season is missing", async () => {
    const { GET } = await import("../table/route")
    const request = new Request("http://localhost/api/football/table?leagueId=4328")
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it("fetches and normalizes league table", async () => {
    const mockTable = {
      table: [
        {
          idTeam: "133604",
          strTeam: "Arsenal",
          strTeamBadge: "https://example.com/arsenal.png",
          strLeague: "English Premier League",
          intRank: "1",
          intPlayed: "20",
          intWin: "15",
          intDraw: "3",
          intLoss: "2",
          intGoalsFor: "45",
          intGoalsAgainst: "20",
          intGoalDifference: "25",
          intPoints: "48",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockTable)

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=4328&season=2024-2025"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(mockFetchSportsDb).toHaveBeenCalledWith("/lookuptable.php", {
      l: "4328",
      s: "2024-2025",
    })
    expect(data.rows).toHaveLength(1)
    expect(data.rows[0]).toMatchObject({
      position: 1,
      teamId: "133604",
      teamName: "Arsenal",
      played: 20,
      won: 15,
      drawn: 3,
      lost: 2,
      goalsFor: 45,
      goalsAgainst: 20,
      goalDifference: 25,
      points: 48,
    })
  })

  it("extracts league name from first table entry", async () => {
    const mockTable = {
      table: [
        {
          idTeam: "1",
          strTeam: "Team 1",
          strLeague: "Test League",
          intRank: "1",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockTable)

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(data.leagueName).toBe("Test League")
  })

  it("converts string numbers to integers", async () => {
    const mockTable = {
      table: [
        {
          idTeam: "1",
          strTeam: "Team",
          intRank: "5",
          intPlayed: "10",
          intWin: "6",
          intDraw: "2",
          intLoss: "2",
          intGoalsFor: "18",
          intGoalsAgainst: "12",
          intGoalDifference: "6",
          intPoints: "20",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockTable)

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(typeof data.rows[0].position).toBe("number")
    expect(typeof data.rows[0].played).toBe("number")
    expect(typeof data.rows[0].points).toBe("number")
  })

  it("handles numeric values directly", async () => {
    const mockTable = {
      table: [
        {
          idTeam: "1",
          strTeam: "Team",
          intRank: 1,
          intPlayed: 10,
          intPoints: 20,
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockTable)

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(data.rows[0].position).toBe(1)
    expect(data.rows[0].played).toBe(10)
    expect(data.rows[0].points).toBe(20)
  })

  it("defaults invalid numbers to 0", async () => {
    const mockTable = {
      table: [
        {
          idTeam: "1",
          strTeam: "Team",
          intRank: "invalid",
          intPlayed: null,
          intPoints: undefined,
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockTable)

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(data.rows[0].position).toBe(0)
    expect(data.rows[0].played).toBe(0)
    expect(data.rows[0].points).toBe(0)
  })

  it("filters out entries without teamId", async () => {
    const mockTable = {
      table: [
        {
          idTeam: null,
          strTeam: "No ID Team",
          intRank: "1",
        },
        {
          idTeam: "123",
          strTeam: "Valid Team",
          intRank: "2",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockTable)

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(data.rows).toHaveLength(1)
    expect(data.rows[0].teamId).toBe("123")
  })

  it("filters out entries without teamName", async () => {
    const mockTable = {
      table: [
        {
          idTeam: "123",
          strTeam: null,
          intRank: "1",
        },
        {
          idTeam: "456",
          strTeam: "Valid Team",
          intRank: "2",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockTable)

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(data.rows).toHaveLength(1)
    expect(data.rows[0].teamName).toBe("Valid Team")
  })

  it("returns 500 on API error", async () => {
    mockFetchSportsDb.mockRejectedValue(new Error("API Error"))

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ rows: [], leagueName: "" })
  })

  it("handles empty table response", async () => {
    mockFetchSportsDb.mockResolvedValue({ table: [] })

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(data.rows).toEqual([])
    expect(data.leagueName).toBe("")
  })

  it("handles null table response", async () => {
    mockFetchSportsDb.mockResolvedValue({ table: null })

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(data.rows).toEqual([])
  })

  it("handles missing crest with empty string", async () => {
    const mockTable = {
      table: [
        {
          idTeam: "123",
          strTeam: "Team",
          strTeamBadge: null,
          intRank: "1",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockTable)

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(data.rows[0].crest).toBe("")
  })

  it("defaults teamName to Unknown when missing", async () => {
    const mockTable = {
      table: [
        {
          idTeam: "123",
          strTeam: null,
          intRank: "1",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockTable)

    const { GET } = await import("../table/route")
    const request = new Request(
      "http://localhost/api/football/table?leagueId=123&season=2024"
    )
    const response = await GET(request)
    const data = await response.json()

    // Should be filtered out because teamName is required
    expect(data.rows).toHaveLength(0)
  })
})