"use client"

import { useEffect, useMemo, useState } from "react"

type MediaType = "Movie" | "TV"

type MediaItem = {
  id: string
  title: string
  type: MediaType
  year: string
  genre: string
}

const STORAGE_KEY = "smfc-watchlist"

const RECOMMENDED: MediaItem[] = [
  { id: "dune-2", title: "Dune: Part Two", type: "Movie", year: "2024", genre: "Sci-Fi" },
  { id: "top-gun", title: "Top Gun: Maverick", type: "Movie", year: "2022", genre: "Action" },
  { id: "severance", title: "Severance", type: "TV", year: "2022", genre: "Thriller" },
  { id: "last-of-us", title: "The Last of Us", type: "TV", year: "2023", genre: "Drama" },
  { id: "fallout", title: "Fallout", type: "TV", year: "2024", genre: "Sci-Fi" },
  { id: "poor-things", title: "Poor Things", type: "Movie", year: "2023", genre: "Comedy" },
]

export default function MediaWatchlist() {
  const [watchlist, setWatchlist] = useState<MediaItem[]>(() => {
    if (typeof window === "undefined") return []
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    try {
      return JSON.parse(stored) as MediaItem[]
    } catch {
      return []
    }
  })
  const [title, setTitle] = useState("")
  const [type, setType] = useState<MediaType>("Movie")
  const [year, setYear] = useState("")
  const [genre, setGenre] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  const recommended = useMemo(() => {
    const ids = new Set(watchlist.map((w) => w.id))
    return RECOMMENDED.filter((item) => !ids.has(item.id))
  }, [watchlist])

  function addToWatchlist(item: MediaItem) {
    setWatchlist((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
      return [...prev, item]
    })
  }

  function removeFromWatchlist(id: string) {
    setWatchlist((prev) => prev.filter((item) => item.id !== id))
  }

  function handleCustomAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const id = `${title.trim().toLowerCase().replace(/\s+/g, "-")}-${type.toLowerCase()}`
    addToWatchlist({
      id,
      title: title.trim(),
      type,
      year: year || "TBD",
      genre: genre || "Misc",
    })

    setTitle("")
    setYear("")
    setGenre("")
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-smfc-white">
          Movies & TV watchlist
        </h2>
        <p className="text-sm text-neutral-400">
          Keep a combined queue of films and series to watch later.
        </p>
      </div>

      <div className="rounded-2xl border border-smfc-grey bg-smfc-black p-4 shadow-lg shadow-black/30 space-y-4">
        <h3 className="text-sm font-semibold text-smfc-white">Add your own</h3>
        <form onSubmit={handleCustomAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-lg border border-smfc-grey bg-smfc-charcoal px-3 py-2 text-sm text-smfc-white placeholder:text-neutral-500 focus:outline-none focus:border-smfc-red"
          />
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MediaType)}
              className="rounded-lg border border-smfc-grey bg-smfc-charcoal px-3 py-2 text-sm text-smfc-white focus:outline-none focus:border-smfc-red"
            >
              <option value="Movie">Movie</option>
              <option value="TV">TV</option>
            </select>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Year"
              className="w-full rounded-lg border border-smfc-grey bg-smfc-charcoal px-3 py-2 text-sm text-smfc-white placeholder:text-neutral-500 focus:outline-none focus:border-smfc-red"
            />
          </div>
          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
            className="rounded-lg border border-smfc-grey bg-smfc-charcoal px-3 py-2 text-sm text-smfc-white placeholder:text-neutral-500 focus:outline-none focus:border-smfc-red"
          />
          <button
            type="submit"
            className="rounded-lg bg-smfc-red px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Add to list
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-smfc-white">Recommended</h3>
          <span className="text-xs text-neutral-500">Tap to save</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {recommended.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addToWatchlist(item)}
              className="rounded-xl border border-smfc-grey bg-smfc-charcoal px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-smfc-red"
            >
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="rounded-full bg-smfc-black px-2 py-0.5 text-[11px] font-semibold text-smfc-white">
                  {item.type}
                </span>
                <span>{item.year}</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-smfc-white">
                {item.title}
              </div>
              <div className="text-xs text-neutral-500">{item.genre}</div>
            </button>
          ))}
          {recommended.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-smfc-grey/70 bg-smfc-charcoal px-3 py-4 text-sm text-neutral-400">
              All recommended titles are already on your list.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-smfc-white">Your watchlist</h3>
          <span className="text-xs text-neutral-500">
            {watchlist.length} item{watchlist.length === 1 ? "" : "s"}
          </span>
        </div>
        {watchlist.length === 0 ? (
          <div className="rounded-xl border border-dashed border-smfc-grey/70 bg-smfc-charcoal px-3 py-4 text-sm text-neutral-400">
            Add movies or shows to build your queue.
          </div>
        ) : (
          <ul className="space-y-2">
            {watchlist.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-smfc-grey bg-smfc-black px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="rounded-full bg-smfc-charcoal px-2 py-1 text-[11px] font-semibold text-smfc-white">
                    {item.type}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-smfc-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {item.genre} • {item.year}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromWatchlist(item.id)}
                  className="text-xs font-semibold text-smfc-red hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
