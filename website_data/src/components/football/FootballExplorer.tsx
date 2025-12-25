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
  const [teamName, setTeamName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detailsRef = useRef<HTMLDivElement | null>(null)
  const handleLeagueChange = useCallback(
    (id: string, nextSeason: string, name: string) => {
      setLoading(true)
      setError(null)
      setRows([])
      setLeagueId(id)
      setSeason(nextSeason)
      setLeagueName(name)
      setTeamName("")
      setTeamId("") // reset before auto-select
    },
    []
  )

  // 🔁 Fetch league table
  useEffect(() => {
    if (!leagueId || !season) return

    let alive = true

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
          setTeamName("")
          return
        }

        // Auto-select St Mirren if present, otherwise first team
        const stMirren = nextRows.find((r: LeagueRow) =>
          r.teamName.toLowerCase().includes("st mirren")
        )

        const autoTeam = stMirren ?? nextRows[0]

        setTeamId(autoTeam?.teamId ?? "")
        setTeamName(autoTeam?.teamName ?? "")

      })
      .catch(() => {
        if (!alive) return
        setRows([])
        setTeamId("")
        setTeamName("")
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

  const selectedRow = rows.find((row) => row.teamId === teamId)

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
          onSelectTeam={(id, name) => {
            setTeamId(id)
            setTeamName(name)
          }}
        />
      ) : (
        <div className="rounded-xl border border-smfc-grey bg-smfc-charcoal px-4 py-3 text-sm text-neutral-300">
          {error ?? "Select a league to view standings"}
        </div>
      )}

      <div ref={detailsRef} className="space-y-4">
        {teamId ? (
          <>
            <TeamSnapshot
              teamId={teamId}
              teamName={teamName || selectedRow?.teamName}
              leagueId={leagueId}
              leagueName={leagueName}
              season={season}
              fallbackPosition={selectedRow?.position}
              fallbackTeamName={selectedRow?.teamName ?? teamName ?? leagueName}
            />
            <OnThisDay
              teamId={teamId}
              teamName={teamName || selectedRow?.teamName}
            />
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
