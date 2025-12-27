import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetchSportsDb = vi.fn()

vi.mock("@/lib/sportsDbApi", () => ({
  fetchSportsDb: (path: string, query: Record<string, unknown>) =>
    mockFetchSportsDb(path, query),
}))

describe("GET /api/football/search", () => {
  beforeEach(() => {
    mockFetchSportsDb.mockReset()
    vi.resetModules()
  })

  it("returns empty results when query is missing", async () => {
    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search")
    const response = await GET(request)
    const data = await response.json()

    expect(data).toEqual({ leagues: [], teams: [] })
    expect(mockFetchSportsDb).not.toHaveBeenCalled()
  })

  it("returns empty results when query is empty string", async () => {
    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=")
    const response = await GET(request)
    const data = await response.json()

    expect(data).toEqual({ leagues: [], teams: [] })
  })

  it("searches both leagues and teams", async () => {
    const mockLeaguesResponse = {
      leagues: [
        {
          idLeague: "4328",
          strLeague: "English Premier League",
          strSport: "Soccer",
          strCurrentSeason: "2024-2025",
        },
      ],
    }

    const mockTeamsResponse = {
      teams: [
        {
          idTeam: "133604",
          strTeam: "Arsenal",
          strTeamBadge: "https://example.com/arsenal.png",
          idLeague: "4328",
          strLeague: "English Premier League",
        },
      ],
    }

    mockFetchSportsDb
      .mockResolvedValueOnce(mockLeaguesResponse)
      .mockResolvedValueOnce(mockTeamsResponse)

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=Arsenal")
    const response = await GET(request)
    const data = await response.json()

    expect(mockFetchSportsDb).toHaveBeenCalledWith("/all_leagues.php", { s: "Soccer" })
    expect(mockFetchSportsDb).toHaveBeenCalledWith("/searchteams.php", { t: "Arsenal" })
    expect(data.leagues).toHaveLength(1)
    expect(data.teams).toHaveLength(1)
  })

  it("filters leagues by query string", async () => {
    const mockLeaguesResponse = {
      leagues: [
        {
          idLeague: "4328",
          strLeague: "English Premier League",
          strSport: "Soccer",
          strCurrentSeason: "2024-2025",
        },
        {
          idLeague: "4331",
          strLeague: "German Bundesliga",
          strSport: "Soccer",
          strCurrentSeason: "2024-2025",
        },
      ],
    }

    mockFetchSportsDb
      .mockResolvedValueOnce(mockLeaguesResponse)
      .mockResolvedValueOnce({ teams: [] })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=english")
    const response = await GET(request)
    const data = await response.json()

    expect(data.leagues).toHaveLength(1)
    expect(data.leagues[0].name).toBe("English Premier League")
  })

  it("limits league results to 8", async () => {
    const leagues = Array.from({ length: 15 }, (_, i) => ({
      idLeague: String(i),
      strLeague: `League ${i}`,
      strSport: "Soccer",
      strCurrentSeason: "2024",
    }))

    mockFetchSportsDb
      .mockResolvedValueOnce({ leagues })
      .mockResolvedValueOnce({ teams: [] })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=league")
    const response = await GET(request)
    const data = await response.json()

    expect(data.leagues).toHaveLength(8)
  })

  it("limits team results to 12", async () => {
    const teams = Array.from({ length: 20 }, (_, i) => ({
      idTeam: String(i),
      strTeam: `Team ${i}`,
      strTeamBadge: null,
      idLeague: "1",
      strLeague: "Test League",
    }))

    mockFetchSportsDb
      .mockResolvedValueOnce({ leagues: [] })
      .mockResolvedValueOnce({ teams })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=team")
    const response = await GET(request)
    const data = await response.json()

    expect(data.teams).toHaveLength(12)
  })

  it("filters out teams without id", async () => {
    const mockTeamsResponse = {
      teams: [
        {
          idTeam: null,
          strTeam: "No ID Team",
          strTeamBadge: null,
        },
        {
          idTeam: "123",
          strTeam: "Valid Team",
          strTeamBadge: null,
        },
      ],
    }

    mockFetchSportsDb
      .mockResolvedValueOnce({ leagues: [] })
      .mockResolvedValueOnce(mockTeamsResponse)

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=team")
    const response = await GET(request)
    const data = await response.json()

    expect(data.teams).toHaveLength(1)
    expect(data.teams[0].id).toBe("123")
  })

  it("adds kind field to team results", async () => {
    const mockTeamsResponse = {
      teams: [
        {
          idTeam: "123",
          strTeam: "Arsenal",
          strTeamBadge: null,
        },
      ],
    }

    mockFetchSportsDb
      .mockResolvedValueOnce({ leagues: [] })
      .mockResolvedValueOnce(mockTeamsResponse)

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=arsenal")
    const response = await GET(request)
    const data = await response.json()

    expect(data.teams[0].kind).toBe("team")
  })

  it("returns 500 on API error", async () => {
    mockFetchSportsDb.mockRejectedValue(new Error("API Error"))

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=test")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ leagues: [], teams: [] })
  })

  it("trims query string", async () => {
    mockFetchSportsDb
      .mockResolvedValueOnce({ leagues: [] })
      .mockResolvedValueOnce({ teams: [] })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=  arsenal  ")
    await GET(request)

    expect(mockFetchSportsDb).toHaveBeenCalledWith("/searchteams.php", { t: "arsenal" })
  })

  it("performs case-insensitive league search", async () => {
    const mockLeaguesResponse = {
      leagues: [
        {
          idLeague: "1",
          strLeague: "English Premier League",
          strSport: "Soccer",
          strCurrentSeason: "2024",
        },
      ],
    }

    mockFetchSportsDb
      .mockResolvedValueOnce(mockLeaguesResponse)
      .mockResolvedValueOnce({ teams: [] })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=ENGLISH")
    const response = await GET(request)
    const data = await response.json()

    expect(data.leagues).toHaveLength(1)
  })

  it("handles null team badge", async () => {
    const mockTeamsResponse = {
      teams: [
        {
          idTeam: "123",
          strTeam: "Team",
          strTeamBadge: null,
        },
      ],
    }

    mockFetchSportsDb
      .mockResolvedValueOnce({ leagues: [] })
      .mockResolvedValueOnce(mockTeamsResponse)

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=team")
    const response = await GET(request)
    const data = await response.json()

    expect(data.teams[0].badge).toBeNull()
  })

  it("includes league information in team results", async () => {
    const mockTeamsResponse = {
      teams: [
        {
          idTeam: "123",
          strTeam: "Arsenal",
          strTeamBadge: null,
          idLeague: "4328",
          strLeague: "English Premier League",
        },
      ],
    }

    mockFetchSportsDb
      .mockResolvedValueOnce({ leagues: [] })
      .mockResolvedValueOnce(mockTeamsResponse)

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/football/search?query=arsenal")
    const response = await GET(request)
    const data = await response.json()

    expect(data.teams[0].leagueId).toBe("4328")
    expect(data.teams[0].leagueName).toBe("English Premier League")
  })
})