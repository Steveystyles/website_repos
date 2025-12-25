"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

type TeamDetails = {
  teamName: string
  manager: string
  leaguePosition: number
  crest?: string | null
  nextMatch: {
    opponent: string
    date: string
    homeAway: "H" | "A"
  }
}

type Props = {
  teamId: string
  teamName?: string
  leagueId: string
  leagueName?: string
  season: string
  fallbackTeamName?: string
  fallbackPosition?: number
}

export default function TeamSnapshot({
  teamId,
  teamName,
  leagueId,
  leagueName,
  season,
  fallbackPosition,
  fallbackTeamName,
}: Props) {
  const [data, setData] = useState<TeamDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCrest, setShowCrest] = useState(true)

  const search = useMemo(() => {
    const params = new URLSearchParams()
    if (teamId) params.set("teamId", teamId)
    if (teamName) params.set("teamName", teamName)
    if (leagueId) params.set("leagueId", leagueId)
    if (leagueName) params.set("leagueName", leagueName)
    if (season) params.set("season", season)
    return params.toString()
  }, [leagueId, leagueName, season, teamId, teamName])

  useEffect(() => {
    // 🔥 Clear stale data immediately when team changes
    setData(null)
    setError(null)
    setShowCrest(true)

    if (!teamId) return

    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setShowCrest(true)

    ;(async () => {
      try {
        const res = await fetch(`/api/football/team-details?${search}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          setData(null)
          setError("Team data unavailable")
          return
        }

        const json = (await res.json()) as TeamDetails
        setData(json)
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setError("Failed to load team data")
        setData(null)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [search, teamId])

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

  const prettyDate = data.nextMatch?.date
    ? new Date(data.nextMatch.date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "Date TBC"
  const hasLeaguePosition = Number.isFinite(data.leaguePosition) && data.leaguePosition > 0

  return (
    <div className="rounded-xl border border-smfc-grey bg-smfc-black shadow-lg shadow-black/30 overflow-hidden">
      {/* Header */}
      <div className="relative bg-smfc-charcoal px-4 py-3 flex items-center gap-3">
        <div className="absolute left-0 top-0 h-[3px] w-full bg-smfc-red" />

        {/* Team crest */}
        {showCrest && (
          <Image
            src={data.crest || `/teams/${teamId}.svg`}
            alt={`${data.teamName} crest`}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full bg-smfc-black object-contain"
            onError={() => setShowCrest(false)}
            priority
          />
        )}

        <h3 className="text-lg font-bold tracking-wide text-smfc-white">
          {data.teamName || fallbackTeamName || teamName}
        </h3>
      </div>
      {/* Body */}
      <div className="p-4 space-y-2">
        <div className="text-sm text-neutral-300">
          <span className="font-semibold text-smfc-white">Manager:</span>{" "}
          {data.manager || "Unavailable"}
        </div>

        <div className="text-sm text-neutral-300">
          <span className="font-semibold text-smfc-white">League position:</span>{" "}
          {hasLeaguePosition
            ? data.leaguePosition
            : fallbackPosition ?? "—"}
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
