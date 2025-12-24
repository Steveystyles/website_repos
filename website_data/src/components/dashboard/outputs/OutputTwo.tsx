"use client"

import { useEffect, useMemo, useState } from "react"
import OutputTwoSkeleton from "./OutputTwoSkeleton"

type Movie = {
  id: string
  title: string
  year: string
  type: string
  poster: string | null
}

export default function OutputTwo() {
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("st mirren")
  const [movies, setMovies] = useState<Movie[]>([])
  const [message, setMessage] = useState("Try searching for your favourite film")
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const canSearch = useMemo(() => query.trim().length > 1, [query])

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (!canSearch) return

    setSearching(true)
    setError(null)
    setMessage("")

    try {
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query.trim())}`)
      if (!res.ok) {
        const { error: apiError, message: apiMessage } = await res.json()
        setError(apiError ?? "Search failed. Please try again.")
        setMovies([])
        setMessage(apiMessage ?? "")
        return
      }

      const data = await res.json()
      setMovies(data.results ?? [])
      setMessage(data.message ?? (data.results?.length ? "" : "No results found."))
    } catch (err) {
      console.error(err)
      setError("Unable to search right now. Please try again.")
      setMovies([])
    } finally {
      setSearching(false)
    }
  }

  if (loading) return <OutputTwoSkeleton />

  return (
    <div className="h-full overflow-y-auto space-y-4">
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-smfc-white">
          Movie Explorer
        </h2>
        <p className="text-xs text-neutral-400">
          Search films with the same look and feel as the league table.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="flex gap-2 rounded-xl border border-smfc-grey bg-smfc-black px-3 py-2 shadow-inner shadow-black/20"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="flex-1 bg-transparent text-sm text-smfc-white placeholder:text-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canSearch || searching}
          className={`
            rounded-lg px-3 py-1 text-sm font-semibold transition-colors
            ${canSearch && !searching
              ? "bg-smfc-red text-smfc-white hover:bg-red-700"
              : "bg-smfc-grey text-neutral-400 cursor-not-allowed"}
          `}
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {message && !movies.length && !error && (
        <div className="rounded-lg border border-smfc-grey bg-smfc-charcoal px-3 py-2 text-xs text-neutral-300">
          {message}
        </div>
      )}

      <div className="rounded-xl border border-smfc-grey bg-smfc-black shadow-lg shadow-black/30">
        <div className="relative bg-smfc-charcoal px-4 py-3">
          <div className="absolute left-0 top-0 h-[3px] w-full bg-smfc-red" />
          <h3 className="text-lg font-bold tracking-wide text-smfc-white">
            Movie Results
          </h3>
        </div>

        <div className="divide-y divide-smfc-grey max-h-96 overflow-y-auto">
          {movies.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-neutral-400">
              No movies yet. Try a search above.
            </div>
          ) : (
            movies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-smfc-charcoal/60 transition-colors"
              >
                {movie.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={movie.poster}
                    alt=""
                    className="h-12 w-8 rounded object-cover bg-smfc-grey"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-12 w-8 rounded bg-smfc-grey" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-smfc-white">
                      {movie.title}
                    </p>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {movie.year}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    {movie.type}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
