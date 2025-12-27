import { describe, it, expect, vi, beforeEach } from "vitest"

const getServerSession = vi.fn()
const redirect = vi.fn()

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}))

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirect(path),
}))

vi.mock("@/auth/auth", () => ({
  authOptions: {},
}))

describe("requireAdmin", () => {
  beforeEach(() => {
    getServerSession.mockReset()
    redirect.mockReset()
    vi.resetModules()
  })

  it("redirects to /login when no session exists", async () => {
    const { requireAdmin } = await import("../requireAdmin")
    getServerSession.mockResolvedValue(null)

    await requireAdmin()

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("redirects to /login when session has no user", async () => {
    const { requireAdmin } = await import("../requireAdmin")
    getServerSession.mockResolvedValue({ user: null })

    await requireAdmin()

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("redirects to / when user is not an admin", async () => {
    const { requireAdmin } = await import("../requireAdmin")
    getServerSession.mockResolvedValue({
      user: { id: "1", email: "user@test.com", role: "USER" },
    })

    await requireAdmin()

    expect(redirect).toHaveBeenCalledWith("/")
  })

  it("returns session when user is an admin", async () => {
    const { requireAdmin } = await import("../requireAdmin")
    const session = {
      user: { id: "1", email: "admin@test.com", role: "ADMIN" },
    }
    getServerSession.mockResolvedValue(session)

    const result = await requireAdmin()

    expect(result).toEqual(session)
    expect(redirect).not.toHaveBeenCalled()
  })

  it("calls getServerSession with authOptions", async () => {
    const { requireAdmin } = await import("../requireAdmin")
    const { authOptions } = await import("@/auth/auth")
    getServerSession.mockResolvedValue({
      user: { role: "ADMIN" },
    })

    await requireAdmin()

    expect(getServerSession).toHaveBeenCalledWith(authOptions)
  })

  it("checks role case-sensitively", async () => {
    const { requireAdmin } = await import("../requireAdmin")
    getServerSession.mockResolvedValue({
      user: { id: "1", email: "user@test.com", role: "admin" },
    })

    await requireAdmin()

    // Should redirect because role is lowercase
    expect(redirect).toHaveBeenCalledWith("/")
  })

  it("handles undefined user object", async () => {
    const { requireAdmin } = await import("../requireAdmin")
    getServerSession.mockResolvedValue({ user: undefined })

    await requireAdmin()

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("handles session with other roles", async () => {
    const { requireAdmin } = await import("../requireAdmin")
    getServerSession.mockResolvedValue({
      user: { id: "1", email: "moderator@test.com", role: "MODERATOR" },
    })

    await requireAdmin()

    expect(redirect).toHaveBeenCalledWith("/")
  })
})