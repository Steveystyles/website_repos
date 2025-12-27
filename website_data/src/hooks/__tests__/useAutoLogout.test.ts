import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"

const mockSignOut = vi.fn()

vi.mock("next-auth/react", () => ({
  signOut: (options?: unknown) => mockSignOut(options),
}))

// Mock timers
vi.useFakeTimers()

describe("useAutoLogout", () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it("sets up a timer on mount", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    renderHook(() => useAutoLogout())

    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it("calls signOut after 15 minutes of inactivity", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    renderHook(() => useAutoLogout())

    // Fast-forward 15 minutes
    vi.advanceTimersByTime(15 * 60 * 1000)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" })
    })
  })

  it("does not call signOut before timeout", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    renderHook(() => useAutoLogout())

    // Fast-forward 14 minutes
    vi.advanceTimersByTime(14 * 60 * 1000)

    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it("resets timer on mousemove", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    renderHook(() => useAutoLogout())

    // Fast-forward 10 minutes
    vi.advanceTimersByTime(10 * 60 * 1000)

    // Trigger mousemove
    window.dispatchEvent(new Event("mousemove"))

    // Fast-forward another 10 minutes (total 20, but timer was reset)
    vi.advanceTimersByTime(10 * 60 * 1000)

    expect(mockSignOut).not.toHaveBeenCalled()

    // Now fast-forward 5 more minutes (15 from reset)
    vi.advanceTimersByTime(5 * 60 * 1000)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" })
    })
  })

  it("resets timer on mousedown", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    renderHook(() => useAutoLogout())

    vi.advanceTimersByTime(10 * 60 * 1000)
    window.dispatchEvent(new Event("mousedown"))
    vi.advanceTimersByTime(10 * 60 * 1000)

    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it("resets timer on keydown", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    renderHook(() => useAutoLogout())

    vi.advanceTimersByTime(10 * 60 * 1000)
    window.dispatchEvent(new Event("keydown"))
    vi.advanceTimersByTime(10 * 60 * 1000)

    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it("resets timer on touchstart", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    renderHook(() => useAutoLogout())

    vi.advanceTimersByTime(10 * 60 * 1000)
    window.dispatchEvent(new Event("touchstart"))
    vi.advanceTimersByTime(10 * 60 * 1000)

    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it("resets timer on scroll", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    renderHook(() => useAutoLogout())

    vi.advanceTimersByTime(10 * 60 * 1000)
    window.dispatchEvent(new Event("scroll"))
    vi.advanceTimersByTime(10 * 60 * 1000)

    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it("cleans up event listeners on unmount", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    const { unmount } = renderHook(() => useAutoLogout())

    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener")

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousemove", expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith("touchstart", expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function))

    removeEventListenerSpy.mockRestore()
  })

  it("clears timeout on unmount", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    const { unmount } = renderHook(() => useAutoLogout())

    unmount()

    // Fast-forward past the timeout
    vi.advanceTimersByTime(20 * 60 * 1000)

    // Should not call signOut after unmount
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it("handles multiple user interactions", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    renderHook(() => useAutoLogout())

    // Simulate various user activities
    vi.advanceTimersByTime(5 * 60 * 1000)
    window.dispatchEvent(new Event("mousemove"))
    
    vi.advanceTimersByTime(5 * 60 * 1000)
    window.dispatchEvent(new Event("keydown"))
    
    vi.advanceTimersByTime(5 * 60 * 1000)
    window.dispatchEvent(new Event("scroll"))

    // Total time passed: 15 minutes, but timer was reset multiple times
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it("only sets up listeners once", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    const addEventListenerSpy = vi.spyOn(window, "addEventListener")

    const { rerender } = renderHook(() => useAutoLogout())

    const initialCallCount = addEventListenerSpy.mock.calls.length

    // Rerender should not add more listeners
    rerender()

    expect(addEventListenerSpy.mock.calls.length).toBe(initialCallCount)

    addEventListenerSpy.mockRestore()
  })

  it("uses passive listeners for performance", async () => {
    const { default: useAutoLogout } = await import("../useAutoLogout")
    
    const addEventListenerSpy = vi.spyOn(window, "addEventListener")

    renderHook(() => useAutoLogout())

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function),
      { passive: true }
    )
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
      { passive: true }
    )

    addEventListenerSpy.mockRestore()
  })
})