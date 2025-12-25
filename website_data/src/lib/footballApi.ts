const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"

function getApiFootballKey(): string {
  const key = process.env.API_FOOTBALL_KEY?.trim()

  if (!key) {
    throw new Error("API_FOOTBALL_KEY is not configured")
  }

  return key
}

type ApiFootballResponse<T> = {
  response?: T
  errors?: unknown
}

type QueryValue = string | number | undefined | null

export async function fetchApiFootball<T>(
  path: string,
  query: Record<string, QueryValue> = {}
): Promise<ApiFootballResponse<T>> {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    params.set(key, String(value))
  })

  const url = `${API_FOOTBALL_BASE_URL}${path}${params.size > 0 ? `?${params.toString()}` : ""}`

  const res = await fetch(url, {
    headers: {
      "x-apisports-key": getApiFootballKey(),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`API-Football request failed: ${res.status}`)
  }

  return (await res.json()) as ApiFootballResponse<T>
}

export function safeDate(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
