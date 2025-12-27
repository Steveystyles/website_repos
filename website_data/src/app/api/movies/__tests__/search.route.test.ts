import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const mockFetch = vi.fn()
global.fetch = mockFetch

describe("GET /api/movies/search", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    mockFetch.mockReset()
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("returns 400 when query is missing", async () => {
    process.env.OMDB_API_KEY = "test-key"

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain("provide a movie title")
  })

  it("returns 400 when query is empty", async () => {
    process.env.OMDB_API_KEY = "test-key"

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=")
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it("returns 500 when API key not configured", async () => {
    delete process.env.OMDB_API_KEY

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=avatar")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain("OMDB_API_KEY is not set")
  })

  it("searches movies successfully", async () => {
    process.env.OMDB_API_KEY = "test-key"

    const mockResponse = {
      Response: "True",
      Search: [
        {
          imdbID: "tt0499549",
          Title: "Avatar",
          Year: "2009",
          Type: "movie",
          Poster: "https://example.com/avatar.jpg",
        },
      ],
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=avatar")
    const response = await GET(request)
    const data = await response.json()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("apikey=test-key"),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("s=avatar"),
      expect.any(Object)
    )
    expect(data.results).toHaveLength(1)
    expect(data.results[0]).toEqual({
      id: "tt0499549",
      title: "Avatar",
      year: "2009",
      type: "movie",
      poster: "https://example.com/avatar.jpg",
    })
  })

  it("handles N/A poster", async () => {
    process.env.OMDB_API_KEY = "test-key"

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        Response: "True",
        Search: [
          {
            imdbID: "tt123",
            Title: "Movie",
            Year: "2020",
            Type: "movie",
            Poster: "N/A",
          },
        ],
      }),
    })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=movie")
    const response = await GET(request)
    const data = await response.json()

    expect(data.results[0].poster).toBeNull()
  })

  it("handles OMDb error response", async () => {
    process.env.OMDB_API_KEY = "test-key"

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        Response: "False",
        Error: "Movie not found!",
      }),
    })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=xyz123")
    const response = await GET(request)
    const data = await response.json()

    expect(data.results).toEqual([])
    expect(data.message).toBe("Movie not found!")
  })

  it("returns 502 when OMDb API is unreachable", async () => {
    process.env.OMDB_API_KEY = "test-key"

    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
    })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=avatar")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(502)
    expect(data.error).toContain("Unable to reach OMDb")
  })

  it("returns 500 on network error", async () => {
    process.env.OMDB_API_KEY = "test-key"

    mockFetch.mockRejectedValue(new Error("Network error"))

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=avatar")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain("Movie search failed")
  })

  it("trims query parameter", async () => {
    process.env.OMDB_API_KEY = "test-key"

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ Response: "True", Search: [] }),
    })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=  avatar  ")
    await GET(request)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("s=avatar"),
      expect.any(Object)
    )
  })

  it("encodes query parameter", async () => {
    process.env.OMDB_API_KEY = "test-key"

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ Response: "True", Search: [] }),
    })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=Star Wars")
    await GET(request)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("Star%20Wars"),
      expect.any(Object)
    )
  })

  it("uses no-store cache policy", async () => {
    process.env.OMDB_API_KEY = "test-key"

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ Response: "True", Search: [] }),
    })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=test")
    await GET(request)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      { cache: "no-store" }
    )
  })

  it("filters to movie type only", async () => {
    process.env.OMDB_API_KEY = "test-key"

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ Response: "True", Search: [] }),
    })

    const { GET } = await import("../search/route")
    const request = new Request("http://localhost/api/movies/search?q=test")
    await GET(request)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("type=movie"),
      expect.any(Object)
    )
  })
})