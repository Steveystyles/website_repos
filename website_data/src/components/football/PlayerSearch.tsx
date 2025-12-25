"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Player = {
  id: number
  name: string
  age: number | null
  nationality: string | null
  photo: string | null
  team: string | null
  position?: string | null
}

type ApiResponse = {
  suggestions: Player[]
  source?: "live" | "fallback"
}

const FALLBACK_PLAYERS: Player[] = [
  {
    id: 19088,
    name: "Lionel Messi",
    age: 37,
    nationality: "Argentina",
    photo: "https://media-3.api-sports.io/football/players/19088.png",
    team: "Inter Miami",
    position: "Forward",
  },
  {
    id: 874,
    name: "Kylian Mbappé",
    age: 26,
    nationality: "France",
    photo: "https://media-3.api-sports.io/football/players/874.png",
    team: "Paris SG",
    position: "Forward",
  },
  {
    id: 154,
    name: "Kevin De Bruyne",
    age: 33,
    nationality: "Belgium",
    photo: "https://media-3.api-sports.io/football/players/154.png",
    team: "Manchester City",
    position: "Midfielder",
  },
  {
    id: 3185,
    name: "Luis Suárez",
    age: 38,
    nationality: "Uruguay",
    photo: "https://media-1.api-sports.io/football/players/3185.png",
    team: "Inter Miami",
    position: "Forward",
  },
]

export default function PlayerSearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Player[]>([])
  const [selected, setSelected] = useState<Player | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const showDropdown = suggestions.length > 0 && query.length >= 2

  const selectedMeta = useMemo(() => {
    if (!selected) return null
    const age = selected.age ? `${selected.age} yrs` : "Age N/A"
    const nationality = selected.nationality ?? "Nationality N/A"
    const team = selected.team ?? "Team N/A"
    const position = selected.position ?? "Position N/A"
    return { age, nationality, team, position }
  }, [selected])

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/football/player-search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const json = (await res.json()) as ApiResponse
        setSuggestions(json.suggestions ?? [])
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setError("Could not load player suggestions")
        setSuggestions(FALLBACK_PLAYERS)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 220)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  function handleSelect(player: Player) {
    setSelected(player)
    setQuery(player.name)
    setSuggestions([])
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-wide text-smfc-white">
          Player finder
        </h2>
        <p className="text-sm text-neutral-400">
          Search for a player and view their key details via API-Football.
        </p>
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-smfc-grey bg-smfc-black px-3 py-2 focus-within:border-smfc-red transition-colors">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-neutral-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m15.5 15.5 3 3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a player (min 2 characters)…"
            className="w-full bg-transparent text-sm text-smfc-white placeholder:text-neutral-500 focus:outline-none"
          />
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-600 border-t-smfc-red" />
          )}
        </div>

        {showDropdown && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-smfc-grey bg-smfc-charcoal shadow-lg shadow-black/30 max-h-64 overflow-y-auto">
            {suggestions.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => handleSelect(player)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-smfc-black transition-colors"
              >
                {player.photo ? (
                  <img
                    src={player.photo}
                    alt=""
                    className="h-8 w-8 rounded-full border border-smfc-grey object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full border border-smfc-grey bg-neutral-800" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-smfc-white">
                    {player.name}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {player.team ?? "Unknown team"} • {player.nationality ?? "N/A"}
                  </div>
                </div>
              </button>
            ))}
            {suggestions.length === 0 && (
              <div className="px-3 py-2 text-sm text-neutral-400">
                No suggestions yet
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-smfc-grey bg-smfc-charcoal px-3 py-2 text-sm text-smfc-red">
          {error}
        </div>
      )}

      {selected ? (
        <div className="rounded-2xl border border-smfc-grey bg-smfc-black shadow-lg shadow-black/40 overflow-hidden">
          <div className="relative h-28 bg-gradient-to-r from-smfc-charcoal to-black">
            {selected.photo && (
              <img
                src={selected.photo}
                alt=""
                className="absolute left-4 bottom-2 h-20 w-20 rounded-2xl border border-smfc-grey object-cover shadow-[0_10px_30px_rgba(0,0,0,0.55)]"
                loading="lazy"
              />
            )}
            <div className="absolute bottom-3 left-28 right-3">
              <h3 className="text-lg font-bold text-smfc-white leading-tight">
                {selected.name}
              </h3>
              <p className="text-sm text-neutral-300">
                {selectedMeta?.team} • {selectedMeta?.nationality}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 text-sm text-neutral-200">
            <div className="rounded-lg border border-smfc-grey/60 bg-smfc-charcoal px-3 py-2">
              <p className="text-xs text-neutral-400">Age</p>
              <p className="font-semibold text-smfc-white">{selectedMeta?.age}</p>
            </div>
            <div className="rounded-lg border border-smfc-grey/60 bg-smfc-charcoal px-3 py-2">
              <p className="text-xs text-neutral-400">Position</p>
              <p className="font-semibold text-smfc-white">{selectedMeta?.position}</p>
            </div>
            <div className="rounded-lg border border-smfc-grey/60 bg-smfc-charcoal px-3 py-2">
              <p className="text-xs text-neutral-400">Nationality</p>
              <p className="font-semibold text-smfc-white">
                {selectedMeta?.nationality}
              </p>
            </div>
            <div className="rounded-lg border border-smfc-grey/60 bg-smfc-charcoal px-3 py-2">
              <p className="text-xs text-neutral-400">Current club</p>
              <p className="font-semibold text-smfc-white">
                {selectedMeta?.team}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-smfc-grey/70 bg-smfc-charcoal px-3 py-4 text-sm text-neutral-400">
          Start typing to search for a player. Select a suggestion to view details.
        </div>
      )}
    </div>
  )
}
