<<<<<<< HEAD
=======
<<<<<<< HEAD
const DEFAULT_SPORTS_DB_KEY = "123"
const SPORTS_DB_BASE_URL = "https://www.thesportsdb.com/api/v2/
json"
=======
>>>>>>> dev
import fs from "node:fs"

const DEFAULT_SPORTS_DB_KEY = "1"
const SPORTS_DB_BASE_URL = "https://www.thesportsdb.com/api/v2/json"
<<<<<<< HEAD
=======
>>>>>>> f70c93a (Rebuild football explorer with TheSportsDB v2)
>>>>>>> dev

type QueryValue = string | number | undefined | null

let cachedKey: string | null = null

function readSecretKey(): string | null {
  const secretPath = process.env.SPORTSDB_API_KEY_FILE ?? "/run/secrets/SPORTSDB_API_KEY"

  try {
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, "utf-8").trim()
    }
  } catch (error) {
    console.warn("Unable to read SportsDB secret file", error)
  }

  return null
}

function getSportsDbKey() {
  if (cachedKey) return cachedKey

  const envKey = process.env.SPORTSDB_API_KEY?.trim()
  if (envKey) {
    cachedKey = envKey
    return cachedKey
  }

  const secretKey = readSecretKey()
  if (secretKey) {
    cachedKey = secretKey
    return cachedKey
  }

  console.warn("SPORTSDB_API_KEY missing; using default demo key")
  cachedKey = DEFAULT_SPORTS_DB_KEY
  return cachedKey
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
