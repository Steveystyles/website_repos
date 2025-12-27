import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import fs from "node:fs"

// Mock fs module
vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}))

const fsMock = vi.mocked(fs, { partial: true })

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("sportsDbApi", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    fsMock.existsSync.mockReset()
    fsMock.readFileSync.mockReset()
    mockFetch.mockReset()
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("getSportsDbKey", () => {
    it("uses environment variable when set", async () => {
      process.env.SPORTSDB_API_KEY = "env-key-123"
      fsMock.existsSync.mockReturnValue(false)

      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "test" }),
      } as Response)

      await fetchSportsDb("/test")

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/env-key-123/test"),
        expect.any(Object)
      )
    })

    it("reads from secret file when env var not set", async () => {
      delete process.env.SPORTSDB_API_KEY
      process.env.SPORTSDB_API_KEY_FILE = "/custom/secret/path"
      fsMock.existsSync.mockReturnValue(true)
      fsMock.readFileSync.mockReturnValue("secret-file-key\n")

      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "test" }),
      } as Response)

      await fetchSportsDb("/test")

      expect(fsMock.existsSync).toHaveBeenCalledWith("/custom/secret/path")
      expect(fsMock.readFileSync).toHaveBeenCalledWith("/custom/secret/path", "utf-8")
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/secret-file-key/test"),
        expect.any(Object)
      )
    })

    it("uses default secret path when custom path not set", async () => {
      delete process.env.SPORTSDB_API_KEY
      delete process.env.SPORTSDB_API_KEY_FILE
      fsMock.existsSync.mockReturnValue(true)
      fsMock.readFileSync.mockReturnValue("file-key")

      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "test" }),
      } as Response)

      await fetchSportsDb("/test")

      expect(fsMock.existsSync).toHaveBeenCalledWith("/run/secrets/SPORTSDB_API_KEY")
    })

    it("falls back to default key when no key configured", async () => {
      delete process.env.SPORTSDB_API_KEY
      fsMock.existsSync.mockReturnValue(false)

      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "test" }),
      } as Response)

      await fetchSportsDb("/test")

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/1/test"),
        expect.any(Object)
      )
    })

    it("caches the key after first resolution", async () => {
      process.env.SPORTSDB_API_KEY = "cached-key"
      fsMock.existsSync.mockReturnValue(false)

      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "test" }),
      } as Response)

      await fetchSportsDb("/test1")
      await fetchSportsDb("/test2")

      // Environment should only be checked once due to caching
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("/cached-key/test1"),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("/cached-key/test2"),
        expect.any(Object)
      )
    })

    it("handles file read errors gracefully", async () => {
      delete process.env.SPORTSDB_API_KEY
      fsMock.existsSync.mockReturnValue(true)
      fsMock.readFileSync.mockImplementation(() => {
        throw new Error("Read error")
      })

      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "test" }),
      } as Response)

      await fetchSportsDb("/test")

      // Should fall back to default key
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/1/test"),
        expect.any(Object)
      )
    })

    it("trims whitespace from environment variable", async () => {
      process.env.SPORTSDB_API_KEY = "  trimmed-key  \n"
      fsMock.existsSync.mockReturnValue(false)

      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "test" }),
      } as Response)

      await fetchSportsDb("/test")

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/trimmed-key/test"),
        expect.any(Object)
      )
    })
  })

  describe("fetchSportsDb", () => {
    beforeEach(() => {
      process.env.SPORTSDB_API_KEY = "test-key"
      fsMock.existsSync.mockReturnValue(false)
    })

    it("constructs URL correctly with path and query params", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response)

      await fetchSportsDb("/search", { q: "Arsenal", limit: 10 })

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.thesportsdb.com/api/v2/json/test-key/search?q=Arsenal&limit=10",
        { cache: "no-store" }
      )
    })

    it("handles leading slash in path", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response)

      await fetchSportsDb("/teams")

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.thesportsdb.com/api/v2/json/test-key/teams",
        { cache: "no-store" }
      )
    })

    it("handles path without leading slash", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response)

      await fetchSportsDb("teams")

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.thesportsdb.com/api/v2/json/test-key/teams",
        { cache: "no-store" }
      )
    })

    it("filters out undefined and null query parameters", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response)

      await fetchSportsDb("/search", {
        q: "Liverpool",
        limit: undefined,
        offset: null,
        season: "2024",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.thesportsdb.com/api/v2/json/test-key/search?q=Liverpool&season=2024",
        { cache: "no-store" }
      )
    })

    it("converts numeric query values to strings", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response)

      await fetchSportsDb("/lookup", { id: 12345, page: 2 })

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.thesportsdb.com/api/v2/json/test-key/lookup?id=12345&page=2",
        { cache: "no-store" }
      )
    })

    it("handles empty query object", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response)

      await fetchSportsDb("/teams", {})

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.thesportsdb.com/api/v2/json/test-key/teams",
        { cache: "no-store" }
      )
    })

    it("handles no query parameters", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response)

      await fetchSportsDb("/leagues")

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.thesportsdb.com/api/v2/json/test-key/leagues",
        { cache: "no-store" }
      )
    })

    it("returns parsed JSON response on success", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      const mockData = { teams: [{ id: "1", name: "Arsenal" }] }
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await fetchSportsDb("/teams")

      expect(result).toEqual(mockData)
    })

    it("throws error when response is not ok", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response)

      await expect(fetchSportsDb("/not-found")).rejects.toThrow(
        "TheSportsDB request failed: 404"
      )
    })

    it("throws error with correct status code", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response)

      await expect(fetchSportsDb("/error")).rejects.toThrow(
        "TheSportsDB request failed: 500"
      )
    })

    it("uses no-store cache policy", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "test" }),
      } as Response)

      await fetchSportsDb("/test")

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        { cache: "no-store" }
      )
    })

    it("handles fetch network errors", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockRejectedValue(new Error("Network error"))

      await expect(fetchSportsDb("/test")).rejects.toThrow("Network error")
    })

    it("properly encodes special characters in query params", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: "success" }),
      } as Response)

      await fetchSportsDb("/search", { q: "Manchester United" })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("q=Manchester+United"),
        { cache: "no-store" }
      )
    })

    it("handles JSON parse errors gracefully", async () => {
      const { fetchSportsDb } = await import("../sportsDbApi")

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON")
        },
      } as Response)

      await expect(fetchSportsDb("/test")).rejects.toThrow("Invalid JSON")
    })
  })
})