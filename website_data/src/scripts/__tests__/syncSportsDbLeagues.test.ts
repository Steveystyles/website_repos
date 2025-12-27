import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import crypto from "crypto"

const mockFetch = vi.fn()
global.fetch = mockFetch

const mockPrisma = {
  footballMeta: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  footballLeague: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  $transaction: vi.fn(),
  $disconnect: vi.fn(),
}

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}))

describe("syncSportsDbLeagues", () => {
  const sampleLeagues = [
    {
      idLeague: "4328",
      strLeague: "English Premier League",
      strSport: "Soccer",
      strCountry: "England",
    },
    {
      idLeague: "4331",
      strLeague: "German Bundesliga",
      strSport: "Soccer",
      strCountry: "Germany",
    },
    {
      idLeague: "4332",
      strLeague: "Italian Serie A",
      strSport: "Soccer",
      strCountry: "Italy",
    },
    {
      idLeague: "4387",
      strLeague: "NBA",
      strSport: "Basketball",
      strCountry: "USA",
    },
  ]

  beforeEach(() => {
    mockFetch.mockReset()
    mockPrisma.footballMeta.findUnique.mockReset()
    mockPrisma.footballMeta.upsert.mockReset()
    mockPrisma.footballLeague.deleteMany.mockReset()
    mockPrisma.footballLeague.createMany.mockReset()
    mockPrisma.$transaction.mockReset()
    mockPrisma.$disconnect.mockReset()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it("fetches leagues from TheSportsDB API", async () => {
    const responseText = JSON.stringify({ leagues: sampleLeagues })
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma))

    // Need to execute the script
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    // Import and execute
    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.thesportsdb.com/api/v1/json/123/all_leagues.php"
      )
    })

    consoleLogSpy.mockRestore()
  })

  it("filters only Soccer leagues", async () => {
    const responseText = JSON.stringify({ leagues: sampleLeagues })
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma))

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      expect(mockPrisma.footballLeague.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ id: "4328", name: "English Premier League" }),
          expect.objectContaining({ id: "4331", name: "German Bundesliga" }),
          expect.objectContaining({ id: "4332", name: "Italian Serie A" }),
        ]),
      })
    })

    // Should not include NBA (Basketball)
    const createCall = mockPrisma.footballLeague.createMany.mock.calls[0]
    const createdLeagues = createCall[0].data
    expect(createdLeagues).not.toContainEqual(
      expect.objectContaining({ name: "NBA" })
    )

    consoleLogSpy.mockRestore()
  })

  it("skips update when hash matches existing", async () => {
    const responseText = JSON.stringify({ leagues: sampleLeagues })
    const hash = crypto.createHash("sha256").update(responseText).digest("hex")

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue({
      key: "thesportsdb_leagues_hash",
      value: hash,
    })

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("unchanged")
      )
    })

    expect(mockPrisma.$transaction).not.toHaveBeenCalled()

    consoleLogSpy.mockRestore()
  })

  it("updates leagues when hash differs", async () => {
    const responseText = JSON.stringify({ leagues: sampleLeagues })
    const newHash = crypto.createHash("sha256").update(responseText).digest("hex")
    const oldHash = "different-hash"

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue({
      key: "thesportsdb_leagues_hash",
      value: oldHash,
    })

    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma))

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    consoleLogSpy.mockRestore()
  })

  it("deletes existing leagues before creating new ones", async () => {
    const responseText = JSON.stringify({ leagues: sampleLeagues })

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma))

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      expect(mockPrisma.footballLeague.deleteMany).toHaveBeenCalledWith({
        where: { source: "thesportsdb" },
      })
    })

    consoleLogSpy.mockRestore()
  })

  it("saves hash after successful update", async () => {
    const responseText = JSON.stringify({ leagues: sampleLeagues })
    const hash = crypto.createHash("sha256").update(responseText).digest("hex")

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma))

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      expect(mockPrisma.footballMeta.upsert).toHaveBeenCalledWith({
        where: { key: "thesportsdb_leagues_hash" },
        update: { value: hash },
        create: { key: "thesportsdb_leagues_hash", value: hash },
      })
    })

    consoleLogSpy.mockRestore()
  })

  it("filters out leagues without id or name", async () => {
    const invalidLeagues = [
      { idLeague: "", strLeague: "No ID", strSport: "Soccer" },
      { idLeague: "123", strLeague: "", strSport: "Soccer" },
      { idLeague: null, strLeague: "Null ID", strSport: "Soccer" },
      { idLeague: "456", strLeague: null, strSport: "Soccer" },
      { idLeague: "789", strLeague: "Valid League", strSport: "Soccer" },
    ]

    const responseText = JSON.stringify({ leagues: invalidLeagues })

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma))

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      const createCall = mockPrisma.footballLeague.createMany.mock.calls[0]
      expect(createCall[0].data).toHaveLength(1)
      expect(createCall[0].data[0]).toMatchObject({
        id: "789",
        name: "Valid League",
      })
    })

    consoleLogSpy.mockRestore()
  })

  it("handles missing country field", async () => {
    const leaguesWithoutCountry = [
      {
        idLeague: "100",
        strLeague: "International League",
        strSport: "Soccer",
        strCountry: null,
      },
    ]

    const responseText = JSON.stringify({ leagues: leaguesWithoutCountry })

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma))

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      expect(mockPrisma.footballLeague.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            id: "100",
            name: "International League",
            country: null,
          }),
        ],
      })
    })

    consoleLogSpy.mockRestore()
  })

  it("sets source to thesportsdb", async () => {
    const responseText = JSON.stringify({ leagues: [sampleLeagues[0]] })

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma))

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      expect(mockPrisma.footballLeague.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            source: "thesportsdb",
          }),
        ],
      })
    })

    consoleLogSpy.mockRestore()
  })

  it("handles fetch errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    })

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called")
    })

    await expect(import("../syncSportsDbLeagues")).rejects.toThrow("process.exit called")

    consoleErrorSpy.mockRestore()
    processExitSpy.mockRestore()
  })

  it("disconnects from prisma on completion", async () => {
    const responseText = JSON.stringify({ leagues: sampleLeagues })

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => responseText,
    })

    mockPrisma.footballMeta.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma))

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    await import("../syncSportsDbLeagues")

    await vi.waitFor(() => {
      expect(mockPrisma.$disconnect).toHaveBeenCalled()
    })

    consoleLogSpy.mockRestore()
  })

  it("disconnects from prisma even on error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called")
    })

    await expect(import("../syncSportsDbLeagues")).rejects.toThrow()

    await vi.waitFor(() => {
      expect(mockPrisma.$disconnect).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
    processExitSpy.mockRestore()
  })
})