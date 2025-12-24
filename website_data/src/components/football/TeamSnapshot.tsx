"use client"

import { useEffect, useState } from "react"

type TeamDetails = {
  teamName: string
  manager: string
  leaguePosition: number
  nextMatch: {
    opponent: string
    date: string
    homeAway: "H" | "A"
  }
}

export default function TeamSnapshot({ teamId }: { teamId: string }) {
  const [data, setData] = useState<TeamDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const res = await fetch(`/api/football/team-details?teamId=${teamId}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          setData(null)
          setError("Team data unavailable")
          return
        }

        const json = (await res.json()) as TeamDetails
        setData(json)
      } catch (e: any) {
        // ✅ Ignore abort noise (common on fast changes / dev mode)
        if (e?.name === "AbortError") return
        setError("Failed to load team data")
        setData(null)
      } finally {
        // ✅ Don’t update state if aborted
        if (!controller.signal.aborted) setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [teamId])

  if (loading) {
    return (
      <div className="rounded-xl border border-smfc-grey bg-smfc-charcoal p-4 text-sm text-neutral-300">
        Loading team…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-smfc-grey bg-smfc-charcoal p-4 text-sm text-smfc-red">
        {error ?? "Team data unavailable"}
      </div>
    )
  }

  const prettyDate = new Date(data.nextMatch.date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  return (
    <div className="rounded-xl border border-smfc-grey bg-smfc-black shadow-lg shadow-black/30 overflow-hidden">

    {/* Header */}
    <div className="relative bg-smfc-charcoal px-4 py-3 flex items-center gap-3">
      <div className="absolute left-0 top-0 h-[3px] w-full bg-smfc-red" />

      {/* Team crest */}
      <img
        src={`/teams/${teamId}.svg`}
        alt=""
        className="h-7 w-7"
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.display = "none"
        }}
      />

      <h3 className="text-lg font-bold tracking-wide text-smfc-white">
        {data.teamName}
      </h3>
    </div>
    {/* Body */}
    <div className="p-4 space-y-2">
      
      <div className="text-sm text-neutral-300">
        <span className="font-semibold text-smfc-white">Manager:</span>{" "}
        {data.manager}
      </div>

      <div className="text-sm text-neutral-300">
        <span className="font-semibold text-smfc-white">League position:</span>{" "}
        {data.leaguePosition}
      </div>

      <div className="text-sm text-neutral-300">
        <span className="font-semibold text-smfc-white">Next match:</span>{" "}
        {data.nextMatch.homeAway === "H" ? "Home vs" : "Away at"}{" "}
        {data.nextMatch.opponent}
      </div>

      <div className="text-xs text-neutral-400">
        {prettyDate}
      </div>
    </div>
  </div>
  )
}
