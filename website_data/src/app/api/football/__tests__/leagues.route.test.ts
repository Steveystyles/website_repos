import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetchSportsDb = vi.fn()

vi.mock("@/lib/sportsDbApi", () => ({
  fetchSportsDb: (path: string, query: Record<string, unknown>) =>
    mockFetchSportsDb(path, query),
}))

describe("GET /api/football/leagues", () => {
  beforeEach(() => {
    mockFetchSportsDb.mockReset()
    vi.resetModules()
  })

  it("returns normalized leagues from TheSportsDB", async () => {
    const mockLeagues = {
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

    mockFetchSportsDb.mockResolvedValue(mockLeagues)

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(mockFetchSportsDb).toHaveBeenCalledWith("/all_leagues.php", { s: "Soccer" })
    expect(data).toEqual([
      { id: "4328", name: "English Premier League", season: "2024-2025" },
      { id: "4331", name: "German Bundesliga", season: "2024-2025" },
    ])
  })

  it("filters out non-Soccer leagues", async () => {
    const mockLeagues = {
      leagues: [
        {
          idLeague: "4328",
          strLeague: "English Premier League",
          strSport: "Soccer",
          strCurrentSeason: "2024-2025",
        },
        {
          idLeague: "4387",
          strLeague: "NBA",
          strSport: "Basketball",
          strCurrentSeason: "2024-2025",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockLeagues)

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveLength(1)
    expect(data[0].name).toBe("English Premier League")
  })

  it("sorts leagues alphabetically by name", async () => {
    const mockLeagues = {
      leagues: [
        {
          idLeague: "4334",
          strLeague: "French Ligue 1",
          strSport: "Soccer",
          strCurrentSeason: "2024-2025",
        },
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

    mockFetchSportsDb.mockResolvedValue(mockLeagues)

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(data[0].name).toBe("English Premier League")
    expect(data[1].name).toBe("French Ligue 1")
    expect(data[2].name).toBe("German Bundesliga")
  })

  it("handles missing league name with default", async () => {
    const mockLeagues = {
      leagues: [
        {
          idLeague: "123",
          strLeague: null,
          strSport: "Soccer",
          strCurrentSeason: "2024-2025",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockLeagues)

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(data[0].name).toBe("Unknown league")
  })

  it("handles missing season with current year", async () => {
    const mockLeagues = {
      leagues: [
        {
          idLeague: "4328",
          strLeague: "English Premier League",
          strSport: "Soccer",
          strCurrentSeason: null,
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockLeagues)

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(data[0].season).toBe(String(new Date().getFullYear()))
  })

  it("filters out leagues without id", async () => {
    const mockLeagues = {
      leagues: [
        {
          idLeague: null,
          strLeague: "League Without ID",
          strSport: "Soccer",
          strCurrentSeason: "2024-2025",
        },
        {
          idLeague: "4328",
          strLeague: "Valid League",
          strSport: "Soccer",
          strCurrentSeason: "2024-2025",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockLeagues)

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveLength(1)
    expect(data[0].id).toBe("4328")
  })

  it("trims league names", async () => {
    const mockLeagues = {
      leagues: [
        {
          idLeague: "4328",
          strLeague: "  English Premier League  ",
          strSport: "Soccer",
          strCurrentSeason: "2024-2025",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockLeagues)

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(data[0].name).toBe("English Premier League")
  })

  it("trims season strings", async () => {
    const mockLeagues = {
      leagues: [
        {
          idLeague: "4328",
          strLeague: "English Premier League",
          strSport: "Soccer",
          strCurrentSeason: "  2024-2025  ",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockLeagues)

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(data[0].season).toBe("2024-2025")
  })

  it("returns fallback leagues on API error", async () => {
    mockFetchSportsDb.mockRejectedValue(new Error("API Error"))

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Scottish Premiership" }),
        expect.objectContaining({ name: "English Premier League" }),
      ])
    )
  })

  it("returns fallback leagues when no leagues in response", async () => {
    mockFetchSportsDb.mockResolvedValue({ leagues: [] })

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty("id")
    expect(data[0]).toHaveProperty("name")
    expect(data[0]).toHaveProperty("season")
  })

  it("handles null leagues array", async () => {
    mockFetchSportsDb.mockResolvedValue({ leagues: null })

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it("handles undefined leagues array", async () => {
    mockFetchSportsDb.mockResolvedValue({})

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it("handles case-insensitive sport filtering", async () => {
    const mockLeagues = {
      leagues: [
        {
          idLeague: "1",
          strLeague: "League 1",
          strSport: "soccer",
          strCurrentSeason: "2024",
        },
        {
          idLeague: "2",
          strLeague: "League 2",
          strSport: "SOCCER",
          strCurrentSeason: "2024",
        },
        {
          idLeague: "3",
          strLeague: "League 3",
          strSport: "SoCcEr",
          strCurrentSeason: "2024",
        },
      ],
    }

    mockFetchSportsDb.mockResolvedValue(mockLeagues)

    const { GET } = await import("../leagues/route")
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveLength(3)
  })
})