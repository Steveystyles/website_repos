"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
  crest: string
}

export default function FootballExplorer() {
  const [rows, setRows] = useState<LeagueRow[]>([])
  const [leagueName, setLeagueName] = useState("")
  const [leagueId, setLeagueId] = useState("")
  const [season, setSeason] = useState("")
  const [teamId, setTeamId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detailsRef = useRef<HTMLDivElement | null>(null)
  const handleLeagueChange = useCallback(
    (id: string, nextSeason: string, name: string) => {
      setLeagueId(id)
      setSeason(nextSeason)
      setLeagueName(name)
      setTeamId("") // reset before auto-select
      setError(null)
    },
    []
  )

  // 🔁 Fetch league table
  useEffect(() => {
    if (!leagueId || !season) return

    let alive = true
    setLoading(true)
    setError(null)

    fetch(`/api/football/table?leagueId=${leagueId}&season=${season}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load league table")
        return r.json()
      })
      .then((data) => {
        if (!alive) return

        const nextRows = data.rows ?? []
        setRows(nextRows)
        setLeagueName((prev) => data.leagueName ?? prev ?? "")

        if (nextRows.length === 0) {
          setError("League table is currently unavailable")
          setTeamId("")
          return
        }

        // 🔴 Auto-select St Mirren
        const stMirren = nextRows.find((r: LeagueRow) =>
          r.teamName.toLowerCase().includes("st mirren")
        )

        if (stMirren) {
          setTeamId(stMirren.teamId)
        }
      })
      .catch(() => {
        if (!alive) return
        setRows([])
        setTeamId("")
        setError("Unable to load league table")
      })
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [leagueId, season])

  // Auto-scroll to details
  useEffect(() => {
    if (teamId) {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [teamId])

  return (
    <section className="space-y-5">
      <LeagueSelector
        onChange={handleLeagueChange}
      />

      {loading ? (
        <div className="text-sm text-neutral-400">
          Loading league table…
        </div>
      ) : rows.length > 0 ? (
        <LeagueTable
          leagueName={leagueName}
          rows={rows}
          selectedTeamId={teamId}
          onSelectTeam={setTeamId}
        />
      ) : (
        <div className="rounded-xl border border-smfc-grey bg-smfc-charcoal px-4 py-3 text-sm text-neutral-300">
          {error ?? "Select a league to view standings"}
        </div>
      )}

      <div ref={detailsRef} className="space-y-4">
        {teamId ? (
          <>
            <TeamSnapshot teamId={teamId} />
            <OnThisDay teamId={teamId} />
          </>
        ) : (
          <div className="text-sm text-neutral-400 italic">
            Select a team to view details
          </div>
        )}
      </div>
    </section>
  )
}
