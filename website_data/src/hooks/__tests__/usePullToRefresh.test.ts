import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { default as usePullToRefresh } from "../usePullToRefresh"

describe("usePullToRefresh", () => {
  const mockRefresh = vi.fn()

  beforeEach(() => {
    mockRefresh.mockReset()
    mockRefresh.mockResolvedValue(undefined)
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  it("initializes with zero pull and not refreshing", () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    expect(result.current.pull).toBe(0)
    expect(result.current.refreshing).toBe(false)
  })

  it("captures start position when scrolled to top", () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    // Start position should be captured (verified by subsequent move)
    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 150 }],
      } as React.TouchEvent)
    })

    expect(result.current.pull).toBe(50)
  })

  it("does not capture start when not at top", () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 100 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 150 }],
      } as React.TouchEvent)
    })

    expect(result.current.pull).toBe(0)
  })

  it("updates pull distance on touch move", () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 160 }],
      } as React.TouchEvent)
    })

    expect(result.current.pull).toBe(60)
  })

  it("caps pull distance at 120", () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 300 }],
      } as React.TouchEvent)
    })

    expect(result.current.pull).toBe(120)
  })

  it("does not update pull for negative distance (pull up)", () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 50 }],
      } as React.TouchEvent)
    })

    expect(result.current.pull).toBe(0)
  })

  it("sets triggered flag when pulled over 80", () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 190 }],
      } as React.TouchEvent)
    })

    // Trigger should be set, verified by calling onTouchEnd
    act(() => {
      result.current.onTouchEnd()
    })

    expect(mockRefresh).toHaveBeenCalled()
  })

  it("does not trigger refresh when pulled less than 80", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 170 }],
      } as React.TouchEvent)
    })

    await act(async () => {
      await result.current.onTouchEnd()
    })

    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it("calls onRefresh when triggered", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 190 }],
      } as React.TouchEvent)
    })

    await act(async () => {
      await result.current.onTouchEnd()
    })

    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it("sets refreshing state during refresh", async () => {
    let resolveRefresh: () => void
    const refreshPromise = new Promise<void>((resolve) => {
      resolveRefresh = resolve
    })
    mockRefresh.mockReturnValue(refreshPromise)

    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 190 }],
      } as React.TouchEvent)
    })

    const endPromise = act(async () => {
      await result.current.onTouchEnd()
    })

    expect(result.current.refreshing).toBe(true)

    resolveRefresh!()
    await endPromise

    expect(result.current.refreshing).toBe(false)
  })

  it("resets pull distance after touch end", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 150 }],
      } as React.TouchEvent)
    })

    expect(result.current.pull).toBe(50)

    await act(async () => {
      await result.current.onTouchEnd()
    })

    expect(result.current.pull).toBe(0)
  })

  it("does not trigger move when already refreshing", () => {
    let resolveRefresh: () => void
    const refreshPromise = new Promise<void>((resolve) => {
      resolveRefresh = resolve
    })
    mockRefresh.mockReturnValue(refreshPromise)

    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 190 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchEnd()
    })

    // Try to trigger another move while refreshing
    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 150 }],
      } as React.TouchEvent)
    })

    // Pull should not update while refreshing
    expect(result.current.pull).toBe(0)

    resolveRefresh!()
  })

  it("handles synchronous onRefresh function", async () => {
    const syncRefresh = vi.fn()
    const { result } = renderHook(() => usePullToRefresh(syncRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 190 }],
      } as React.TouchEvent)
    })

    await act(async () => {
      await result.current.onTouchEnd()
    })

    expect(syncRefresh).toHaveBeenCalled()
    expect(result.current.refreshing).toBe(false)
  })

  it("prevents multiple simultaneous refreshes", async () => {
    let resolveRefresh: () => void
    const refreshPromise = new Promise<void>((resolve) => {
      resolveRefresh = resolve
    })
    mockRefresh.mockReturnValue(refreshPromise)

    const { result } = renderHook(() => usePullToRefresh(mockRefresh))

    Object.defineProperty(window, "scrollY", { value: 0 })

    // First pull
    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 190 }],
      } as React.TouchEvent)
    })

    const firstEnd = act(async () => {
      await result.current.onTouchEnd()
    })

    // Try second pull while first is in progress
    act(() => {
      result.current.onTouchStart({
        touches: [{ clientY: 100 }],
      } as React.TouchEvent)
    })

    act(() => {
      result.current.onTouchMove({
        touches: [{ clientY: 190 }],
      } as React.TouchEvent)
    })

    await act(async () => {
      await result.current.onTouchEnd()
    })

    // Should only have been called once
    expect(mockRefresh).toHaveBeenCalledTimes(1)

    resolveRefresh!()
    await firstEnd
  })
})