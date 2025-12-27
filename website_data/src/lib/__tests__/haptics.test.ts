import { describe, it, expect, vi, beforeEach } from "vitest"
import { lightHaptic } from "../haptics"

describe("lightHaptic", () => {
  const mockVibrate = vi.fn()

  beforeEach(() => {
    mockVibrate.mockReset()
    // Reset navigator
    Object.defineProperty(global, "navigator", {
      writable: true,
      configurable: true,
      value: undefined,
    })
  })

  it("calls navigator.vibrate with 10ms when available", () => {
    Object.defineProperty(global, "navigator", {
      writable: true,
      configurable: true,
      value: { vibrate: mockVibrate },
    })

    lightHaptic()

    expect(mockVibrate).toHaveBeenCalledWith(10)
  })

  it("does not throw when navigator is undefined", () => {
    expect(() => lightHaptic()).not.toThrow()
  })

  it("does not throw when navigator.vibrate is not available", () => {
    Object.defineProperty(global, "navigator", {
      writable: true,
      configurable: true,
      value: {},
    })

    expect(() => lightHaptic()).not.toThrow()
  })

  it("handles multiple calls correctly", () => {
    Object.defineProperty(global, "navigator", {
      writable: true,
      configurable: true,
      value: { vibrate: mockVibrate },
    })

    lightHaptic()
    lightHaptic()
    lightHaptic()

    expect(mockVibrate).toHaveBeenCalledTimes(3)
    expect(mockVibrate).toHaveBeenCalledWith(10)
  })

  it("works in server-side rendering context", () => {
    // Simulate SSR where navigator is undefined
    Object.defineProperty(global, "navigator", {
      writable: true,
      configurable: true,
      value: undefined,
    })

    expect(() => lightHaptic()).not.toThrow()
    expect(mockVibrate).not.toHaveBeenCalled()
  })

  it("handles vibrate being null", () => {
    Object.defineProperty(global, "navigator", {
      writable: true,
      configurable: true,
      value: { vibrate: null },
    })

    expect(() => lightHaptic()).not.toThrow()
  })
})