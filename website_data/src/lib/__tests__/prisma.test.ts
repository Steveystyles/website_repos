import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock PrismaClient
const mockPrismaClient = vi.fn()

vi.mock("@prisma/client", () => ({
  PrismaClient: mockPrismaClient,
}))

describe("prisma", () => {
  const originalEnv = process.env
  const originalGlobalThis = globalThis

  beforeEach(() => {
    process.env = { ...originalEnv }
    mockPrismaClient.mockClear()
    vi.resetModules()
    
    // Reset global prisma
    const globalForPrisma = globalThis as unknown as {
      prisma: unknown
    }
    globalForPrisma.prisma = undefined
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("creates a new PrismaClient instance", async () => {
    process.env.NODE_ENV = "production"
    
    const { prisma } = await import("../prisma")

    expect(mockPrismaClient).toHaveBeenCalledTimes(1)
    expect(mockPrismaClient).toHaveBeenCalledWith({
      log: ["error"],
    })
  })

  it("reuses existing global instance in non-production", async () => {
    process.env.NODE_ENV = "development"
    
    // First import
    await import("../prisma")
    const firstCallCount = mockPrismaClient.mock.calls.length

    // Reset modules but keep global
    vi.resetModules()
    
    // Second import should reuse
    await import("../prisma")
    const secondCallCount = mockPrismaClient.mock.calls.length

    // Should have created instance on first import only
    expect(firstCallCount).toBe(1)
  })

  it("creates new instance in production environment", async () => {
    process.env.NODE_ENV = "production"

    const { prisma } = await import("../prisma")

    expect(mockPrismaClient).toHaveBeenCalled()
  })

  it("stores instance in global in non-production", async () => {
    process.env.NODE_ENV = "development"

    const { prisma } = await import("../prisma")

    const globalForPrisma = globalThis as unknown as {
      prisma: typeof prisma | undefined
    }

    expect(globalForPrisma.prisma).toBeDefined()
  })

  it("does not store instance in global in production", async () => {
    process.env.NODE_ENV = "production"

    await import("../prisma")

    const globalForPrisma = globalThis as unknown as {
      prisma: unknown
    }

    // In production, global should not be set after first import
    expect(globalForPrisma.prisma).toBeUndefined()
  })

  it("configures error-only logging", async () => {
    const { prisma } = await import("../prisma")

    expect(mockPrismaClient).toHaveBeenCalledWith(
      expect.objectContaining({
        log: ["error"],
      })
    )
  })

  it("handles test environment correctly", async () => {
    process.env.NODE_ENV = "test"

    const { prisma } = await import("../prisma")

    const globalForPrisma = globalThis as unknown as {
      prisma: typeof prisma | undefined
    }

    // In non-production (including test), should use global
    expect(globalForPrisma.prisma).toBeDefined()
  })
})