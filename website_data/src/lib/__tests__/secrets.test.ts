import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import fs from "fs"
import { readSecret } from "../secrets"

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}))

const fsMock = vi.mocked(fs, { partial: true })

describe("readSecret", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    fsMock.existsSync.mockReset()
    fsMock.readFileSync.mockReset()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("reads from docker secrets when present", () => {
    fsMock.existsSync.mockReturnValue(true)
    fsMock.readFileSync.mockReturnValue("super-secret\n")

    const value = readSecret("MY_SECRET")

    expect(fsMock.existsSync).toHaveBeenCalledWith("/run/secrets/MY_SECRET")
    expect(fsMock.readFileSync).toHaveBeenCalledWith(
      "/run/secrets/MY_SECRET",
      "utf8",
    )
    expect(value).toBe("super-secret")
  })

  it("falls back to environment variables when secret file missing", () => {
    fsMock.existsSync.mockReturnValue(false)
    process.env.API_TOKEN = "token-123"

    const value = readSecret("API_TOKEN")

    expect(value).toBe("token-123")
  })

  it("throws when no secret is configured", () => {
    fsMock.existsSync.mockReturnValue(false)

    expect(() => readSecret("MISSING_SECRET")).toThrow(
      "Secret MISSING_SECRET not found",
    )
  })
})
