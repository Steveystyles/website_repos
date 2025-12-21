import { describe, it, expect, vi, beforeEach } from "vitest"

const getServerSession = vi.fn()

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}))

vi.mock("@/auth/auth", () => ({
  authOptions: {},
}))

describe("requireAdminApi", () => {
  beforeEach(() => {
    getServerSession.mockReset()
    vi.resetModules()
  })

  it("returns 401 when no user session exists", async () => {
    const { requireAdminApi } = await import("../requireAdminApi")
    getServerSession.mockResolvedValue(null)

    const result = await requireAdminApi()

    expect(result).toBeInstanceOf(Response)
    if (result instanceof Response) {
      expect(result.status).toBe(401)
      expect(await result.text()).toBe("Unauthorized")
    }
  })

  it("returns 403 when user is not an admin", async () => {
    const { requireAdminApi } = await import("../requireAdminApi")
    getServerSession.mockResolvedValue({
      user: { role: "USER" },
    })

    const result = await requireAdminApi()

    expect(result).toBeInstanceOf(Response)
    if (result instanceof Response) {
      expect(result.status).toBe(403)
      expect(await result.text()).toBe("Forbidden")
    }
  })

  it("returns the session when user is an admin", async () => {
    const { requireAdminApi } = await import("../requireAdminApi")
    const session = { user: { role: "ADMIN" } }
    getServerSession.mockResolvedValue(session)

    const result = await requireAdminApi()

    expect(result).toEqual(session)
  })
})
