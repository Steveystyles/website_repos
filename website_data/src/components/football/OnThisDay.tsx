"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

type Props = {
  teamId: string
  teamName?: string
}

export default function OnThisDay({ teamId, teamName }: Props) {
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    ;(async () => {
      const params = new URLSearchParams({ teamId })
      if (teamName) params.set("teamName", teamName)

      try {
        const res = await fetch(`/api/football/on-this-day?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          setError("Failed to load history")
          setItems([])
          return
        }

        const json = (await res.json()) as unknown
        setItems(Array.isArray(json) ? (json as string[]) : [])
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setError("Failed to load history")
        setItems([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [teamId, teamName])

  return (
    <div className="rounded-xl border border-smfc-grey bg-smfc-black shadow-lg shadow-black/30 overflow-hidden">
      {/* Header */}
      <div className="relative bg-smfc-charcoal px-4 py-3 flex items-center gap-3">
        {/* Top accent strip */}
        <div className="absolute left-0 top-0 h-[3px] w-full bg-smfc-red" />

        {/* Crest slot (team-based, optional) */}
        <Image
          src="/crest.svg"
          alt="Club crest"
          width={24}
          height={24}
          className="h-6 w-6 opacity-80"
          priority
        />

        <h3 className="text-lg font-bold tracking-wide text-smfc-white">
          On This Day
        </h3>
      </div>

      {/* Body */}
      <div className="p-4">
        {loading && (
          <div className="text-sm text-neutral-300">Loading history…</div>
        )}

        {!loading && error && (
          <div className="text-sm text-smfc-red">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-sm text-neutral-400">No history available</div>
        )}

        <ul className="mt-2 space-y-2 text-sm">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-neutral-200">
              <span className="text-smfc-red">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
