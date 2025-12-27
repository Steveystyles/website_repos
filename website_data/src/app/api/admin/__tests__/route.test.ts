import { describe, it, expect, vi, beforeEach } from "vitest"

const getServerSession = vi.fn()

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}))

vi.mock("@/auth/auth", () => ({
  authOptions: {},
}))

describe("GET /api/admin", () => {
  beforeEach(() => {
    getServerSession.mockReset()
    vi.resetModules()
  })

  it("returns 403 when no session exists", async () => {
    getServerSession.mockResolvedValue(null)

    const { GET } = await import("../route")
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe("Forbidden")
  })

  it("returns 403 when session has no user", async () => {
    getServerSession.mockResolvedValue({ user: null })

    const { GET } = await import("../route")
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe("Forbidden")
  })

  it("returns 403 when user is not admin", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "1", role: "USER" },
    })

    const { GET } = await import("../route")
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe("Forbidden")
  })

  it("returns admin data when user is admin", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "1", role: "ADMIN" },
    })

    const { GET } = await import("../route")
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.secret).toBe("admin-only data")
  })

  it("checks role case-sensitively", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "1", role: "admin" },
    })

    const { GET } = await import("../route")
    const response = await GET()

    expect(response.status).toBe(403)
  })
})