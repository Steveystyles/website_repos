const DEFAULT_SPORTS_DB_KEY = "123"
const SPORTS_DB_BASE_URL = "https://www.thesportsdb.com/api/v1/json"

type QueryValue = string | number | undefined | null

function getSportsDbKey() {
  return process.env.SPORTSDB_API_KEY?.trim() || DEFAULT_SPORTS_DB_KEY
}

export async function fetchSportsDb<T>(
  path: string,
  query: Record<string, QueryValue> = {}
): Promise<T> {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    params.set(key, String(value))
  })

  const key = getSportsDbKey()
  const trimmedPath = path.startsWith("/") ? path.slice(1) : path
  const url = `${SPORTS_DB_BASE_URL}/${key}/${trimmedPath}${params.size > 0 ? `?${params.toString()}` : ""}`

  const res = await fetch(url, { cache: "no-store" })

  if (!res.ok) {
    throw new Error(`TheSportsDB request failed: ${res.status}`)
  }

  return (await res.json()) as T
}
