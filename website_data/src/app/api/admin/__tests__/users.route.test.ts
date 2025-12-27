import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRequireAdminApi = vi.fn()
const mockPrisma = {
  user: {
    findMany: vi.fn(),
  },
}

vi.mock("@/lib/requireAdminApi", () => ({
  requireAdminApi: () => mockRequireAdminApi(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}))

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    mockRequireAdminApi.mockReset()
    mockPrisma.user.findMany.mockReset()
    vi.resetModules()
  })

  it("returns 401 when requireAdminApi returns unauthorized response", async () => {
    mockRequireAdminApi.mockResolvedValue(
      new Response("Unauthorized", { status: 401 })
    )

    const { GET } = await import("../users/route")
    const response = await GET()

    expect(response.status).toBe(401)
  })

  it("returns 403 when requireAdminApi returns forbidden response", async () => {
    mockRequireAdminApi.mockResolvedValue(
      new Response("Forbidden", { status: 403 })
    )

    const { GET } = await import("../users/route")
    const response = await GET()

    expect(response.status).toBe(403)
  })

  it("fetches users when admin authenticated", async () => {
    mockRequireAdminApi.mockResolvedValue({
      user: { id: "1", role: "ADMIN" },
    })

    const mockUsers = [
      { id: "1", email: "admin@test.com", name: "Admin", role: "ADMIN" },
      { id: "2", email: "user@test.com", name: "User", role: "USER" },
    ]

    mockPrisma.user.findMany.mockResolvedValue(mockUsers)

    const { GET } = await import("../users/route")
    const response = await GET()
    const data = await response.json()

    expect(data).toEqual(mockUsers)
  })

  it("orders users by email ascending", async () => {
    mockRequireAdminApi.mockResolvedValue({
      user: { id: "1", role: "ADMIN" },
    })

    mockPrisma.user.findMany.mockResolvedValue([])

    const { GET } = await import("../users/route")
    await GET()

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        email: "asc",
      },
    })
  })

  it("only selects safe user fields", async () => {
    mockRequireAdminApi.mockResolvedValue({
      user: { id: "1", role: "ADMIN" },
    })

    mockPrisma.user.findMany.mockResolvedValue([])

    const { GET } = await import("../users/route")
    await GET()

    const call = mockPrisma.user.findMany.mock.calls[0][0]
    expect(call.select).toEqual({
      id: true,
      email: true,
      name: true,
      role: true,
    })
    // Should NOT include passwordHash
    expect(call.select).not.toHaveProperty("passwordHash")
  })
})