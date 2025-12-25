"use client"

import { useEffect, useRef, useState } from "react"
import LeagueTable from "./LeagueTable"
import TeamSnapshot from "./TeamSnapshot"
import OnThisDay from "./OnThisDay"
import LeagueSelector from "./LeagueSelector"


type LeagueRow = {
  position: number
  teamId: string
  teamName: string
  won: number
  lost: number
  goalDifference: number
  points: number
  crest: string // ✅ ADD THIS
}

const LEAGUE_SLUGS: Record<string, string> = {
  "4328": "scottish-premiership",
  "4329": "scottish-championship",
}

export default function FootballExplorer() {
  const [rows, setRows] = useState<LeagueRow[]>([])
  const [leagueName, setLeagueName] = useState("")
  const [teamId, setTeamId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [leagueId, setLeagueId] = useState("4328")
  const [season, setSeason] = useState("2023")

  const detailsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let alive = true

    setLoading(true)
    setTeamId("")

    const leagueSlug = LEAGUE_SLUGS[leagueId]

    fetch(`/api/football/table?league=${leagueSlug}&season=${season}`)
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`)
        }

        const text = await r.text()
        return text ? JSON.parse(text) : { rows: [], leagueName: "" }
      })
      .then((data) => {
        if (!alive) return
        setRows(data.rows ?? [])
        setLeagueName(data.leagueName ?? "")
      })
      .catch((err) => {
        console.error("League table fetch failed:", err)
        if (!alive) return
        setRows([])
        setLeagueName("")
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [leagueId, season])




  // Auto-scroll when a team is selected
  useEffect(() => {
    if (!teamId) return
    detailsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }, [teamId])

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img src="/crest.svg" alt="" className="h-8 w-8 opacity-90" />
        <div>
          <h2 className="text-lg font-bold tracking-wide text-smfc-white">
            Football Explorer
          </h2>
          <p className="text-xs text-neutral-400">
            Live Scottish Premiership table
          </p>
        </div>
      </div>
      <LeagueSelector
        value={leagueId}
        onChange={(id, season) => {
          setLeagueId(id)
          setSeason(season)
        }}
      />
      {/* League table */}
      {loading ? (
        <div className="text-sm text-neutral-400">Loading league table…</div>
      ) : (
        <LeagueTable
          leagueName={leagueName}
          rows={rows}
          selectedTeamId={teamId}
          onSelectTeam={setTeamId}
        />
      )}

      {/* Detail cards */}
      <div ref={detailsRef} className="space-y-4">
        {teamId ? (
          <>
            <TeamSnapshot teamId={teamId} />
            <OnThisDay teamId={teamId} />
          </>
        ) : (
          <div className="text-sm text-neutral-400 italic">
            Tap a team in the table to view details
          </div>
        )}
      </div>
    </section>
  )
}
