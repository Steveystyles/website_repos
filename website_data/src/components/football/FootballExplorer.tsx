"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import LeagueTable from "./LeagueTable"

type League = {
  id: string
  name: string
  season: string
}

type SearchResult = {
  id: string
  name: string
  badge?: string | null
  leagueId?: string | null
  leagueName?: string | null
  kind: "league" | "team"
}

type TableRow = {
  position: number
  teamId: string
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  crest?: string | null
}

type TeamProfile = {
  teamId: string
  teamName: string
  crest?: string | null
  leagueId?: string | null
  leagueName?: string | null
  season?: string | null
  manager?: string | null
  position?: number | null
  nextMatch?: {
    opponent: string
    date: string
    homeAway: "H" | "A"
  } | null
}

type SearchPayload = {
  leagues: League[]
  teams: SearchResult[]
}

const ST_MIRREN_BADGE = "/crest.svg"

function byQueryMatch(query: string) {
  const lowered = query.trim().toLowerCase()
  if (!lowered) return () => true
  return (value: string) => value.toLowerCase().includes(lowered)
}

export default function FootballExplorer() {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchPayload>({ leagues: [], teams: [] })
  const [leagues, setLeagues] = useState<League[]>([])
  const [activeLeague, setActiveLeague] = useState<League | null>(null)
  const [table, setTable] = useState<TableRow[]>([])
  const [loadingTable, setLoadingTable] = useState(false)
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetch("/api/football/leagues")
      .then((res) => res.json())
      .then((data: League[]) => {
        setLeagues(data)
        setSearchResults((prev) => ({ ...prev, leagues: data }))
      })
      .catch(() => {
        setLeagues([])
      })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const term = query.trim()

    if (!term) {
      setSearchResults((prev) => ({ ...prev, teams: [] }))
      return
    }

    const timeout = setTimeout(() => {
      fetch(`/api/football/search?query=${encodeURIComponent(term)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: SearchPayload) => setSearchResults(data))
        .catch(() => {
          if (!controller.signal.aborted) {
            setSearchResults({ leagues: [], teams: [] })
          }
        })
    }, 200)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [query])

  const visibleLeagues = useMemo(() => {
    const match = byQueryMatch(query)
    return leagues.filter((l) => match(l.name))
  }, [leagues, query])

  const visibleTeams = useMemo(() => {
    if (!query.trim()) return []
    return searchResults.teams
  }, [query, searchResults.teams])

  async function loadTable(targetLeague: League, preferredTeamId?: string) {
    setLoadingTable(true)
    setError(null)
    setTable([])

    try {
      const res = await fetch(
        `/api/football/table?leagueId=${targetLeague.id}&season=${encodeURIComponent(targetLeague.season)}`
      )

      if (!res.ok) throw new Error("Table fetch failed")
      const data = await res.json()
      setTable(data.rows ?? [])

      if (!preferredTeamId) {
        const autoTeam = data.rows?.find((row: TableRow) =>
          row.teamName?.toLowerCase().includes("st mirren")
        ) ?? data.rows?.[0]

        if (autoTeam) {
          void selectTeam(autoTeam.teamId, targetLeague)
        } else {
          setSelectedTeam(null)
        }
      }
    } catch (err) {
      console.error(err)
      setError("Unable to load league table right now.")
      setSelectedTeam(null)
    } finally {
      setLoadingTable(false)
    }
  }

  async function selectTeam(teamId: string, leagueOverride?: League | null) {
    if (!teamId) return

    setLoadingTeam(true)
    setError(null)

    try {
      const params = new URLSearchParams({ teamId })
      if (leagueOverride?.id) params.set("leagueId", leagueOverride.id)
      if (leagueOverride?.season) params.set("season", leagueOverride.season)

      const res = await fetch(`/api/football/team?${params.toString()}`)
      if (!res.ok) throw new Error("Team fetch failed")

      const data = (await res.json()) as TeamProfile
      setSelectedTeam(data)

      if (data.leagueId && (!activeLeague || activeLeague.id !== data.leagueId)) {
        const inferred: League = {
          id: data.leagueId,
          name: data.leagueName ?? "League",
          season: data.season ?? new Date().getFullYear().toString(),
        }
        setActiveLeague(inferred)
        void loadTable(inferred, teamId)
      }
    } catch (err) {
      console.error(err)
      setError("Unable to load team details.")
    } finally {
      setLoadingTeam(false)
    }
  }

  function handleSelect(result: SearchResult) {
    setQuery(result.name)
    if (result.kind === "league") {
      const league: League = {
        id: result.id,
        name: result.name,
        season:
          leagues.find((l) => l.id === result.id)?.season ??
          new Date().getFullYear().toString(),
      }
      setActiveLeague(league)
      void loadTable(league)
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      const league: League | null =
        result.leagueId && result.leagueName
          ? {
              id: result.leagueId,
              name: result.leagueName,
              season: new Date().getFullYear().toString(),
            }
          : activeLeague
      if (league) setActiveLeague(league)
      void selectTeam(result.id, league ?? undefined)
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-smfc-grey bg-smfc-black/70 backdrop-blur-sm shadow-lg shadow-black/40">
        <div className="border-b border-smfc-grey px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-smfc-grey to-smfc-black flex items-center justify-center">
            <span className="text-sm font-bold text-smfc-white">FE</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-smfc-white">Footballexploer</h2>
            <p className="text-xs text-neutral-400">Powered by TheSportsDB v2</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leagues or teams…"
              className="w-full rounded-xl bg-smfc-charcoal border border-smfc-grey px-3 py-2 text-sm text-smfc-white outline-none focus:border-smfc-red"
            />
            <div className="absolute inset-y-0 right-3 flex items-center text-neutral-500 text-xs">
              {query ? "↵" : ""}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1" ref={listRef}>
            {visibleLeagues.length === 0 && visibleTeams.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">Start typing to search…</p>
            ) : (
              <>
                {visibleLeagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() =>
                      handleSelect({ id: league.id, name: league.name, kind: "league" })
                    }
                    className="w-full text-left rounded-lg border border-transparent hover:border-smfc-red/60 bg-smfc-charcoal px-3 py-2 transition"
                  >
                    <div className="text-sm text-smfc-white">{league.name}</div>
                    <div className="text-[11px] text-neutral-500">Season {league.season}</div>
                  </button>
                ))}

                {visibleTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleSelect(team)}
                    className="w-full text-left rounded-lg border border-transparent hover:border-smfc-red/60 bg-smfc-black px-3 py-2 transition flex items-center gap-3"
                  >
                    <div className="h-9 w-9 rounded-full bg-smfc-charcoal flex items-center justify-center overflow-hidden">
                      {team.badge ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={team.badge} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xs text-neutral-400">⚽️</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-smfc-white">{team.name}</div>
                      <div className="text-[11px] text-neutral-500">
                        {team.leagueName ?? "Team"}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              League overview
            </p>
            <h3 className="text-lg font-semibold text-smfc-white">
              {activeLeague?.name ?? "Pick a league or team"}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="h-2 w-2 rounded-full bg-smfc-red" />
            Live data
          </div>
        </div>

        <div className="rounded-2xl border border-smfc-grey bg-smfc-charcoal/80 p-3 shadow-md shadow-black/30">
          {loadingTable ? (
            <div className="text-sm text-neutral-400">Loading table…</div>
          ) : table.length > 0 ? (
            <LeagueTable
              leagueName={activeLeague?.name ?? ""}
              rows={table}
              selectedTeamId={selectedTeam?.teamId ?? ""}
              onSelectTeam={(teamId) => void selectTeam(teamId, activeLeague)}
            />
          ) : (
            <div className="text-sm text-neutral-500">
              {error ?? "No standings yet. Choose a league to begin."}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-smfc-grey bg-smfc-black/80 p-4 shadow-lg shadow-black/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-smfc-charcoal flex items-center justify-center overflow-hidden">
            {selectedTeam?.crest ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedTeam.crest} alt="" className="h-full w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ST_MIRREN_BADGE} alt="" className="h-full w-full object-contain opacity-70" />
            )}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-smfc-white">
              {selectedTeam?.teamName ?? "Select a team"}
            </h4>
            <p className="text-xs text-neutral-400">
              {selectedTeam?.leagueName ?? activeLeague?.name ?? "League pending"}
            </p>
          </div>
        </div>

        {loadingTeam ? (
          <div className="text-sm text-neutral-400">Loading team information…</div>
        ) : selectedTeam ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-smfc-grey bg-smfc-charcoal p-3 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Manager</p>
              <p className="text-sm text-smfc-white">{selectedTeam.manager ?? "Unavailable"}</p>
            </div>
            <div className="rounded-xl border border-smfc-grey bg-smfc-charcoal p-3 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Position</p>
              <p className="text-sm text-smfc-white">
                {selectedTeam.position ? `#${selectedTeam.position}` : "TBD"}
              </p>
            </div>
            <div className="rounded-xl border border-smfc-grey bg-smfc-charcoal p-3 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Next Match</p>
              <p className="text-sm text-smfc-white">
                {selectedTeam.nextMatch
                  ? `${selectedTeam.nextMatch.homeAway === "H" ? "Home vs" : "Away at"} ${
                      selectedTeam.nextMatch.opponent
                    }`
                  : "Pending fixture"}
              </p>
              <p className="text-xs text-neutral-400">
                {selectedTeam.nextMatch?.date
                  ? new Date(selectedTeam.nextMatch.date).toLocaleString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Choose a league or team to see details.</p>
        )}

        {error && (
          <div className="rounded-lg border border-smfc-red/60 bg-smfc-red/10 px-3 py-2 text-sm text-smfc-red">
            {error}
          </div>
        )}
      </div>
    </section>
  )
}
