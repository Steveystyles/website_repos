import { NextResponse } from "next/server"

const FALLBACK = [
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
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")?.trim()

  if (!query) {
    return NextResponse.json({ suggestions: [] })
  }

  const apiKey = process.env.API_FOOTBALL_KEY

  if (!apiKey) {
    return NextResponse.json({ suggestions: FALLBACK, source: "fallback" })
  }

  try {
    const url = `https://v3.football.api-sports.io/players?search=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.error("Player search upstream error:", res.status, res.statusText)
      return NextResponse.json({ suggestions: FALLBACK, source: "fallback" })
    }

    const json = await res.json()
    const items = (json?.response ?? []) as {
      player?: {
        id?: number
        name?: string
        age?: number
        nationality?: string
        photo?: string
      }
      statistics?: Array<{
        team?: { name?: string }
        games?: { position?: string }
      }>
    }[]

    const suggestions = items.slice(0, 15).map((item) => ({
      id: item?.player?.id ?? 0,
      name: item?.player?.name ?? "Unknown",
      age: item?.player?.age ?? null,
      nationality: item?.player?.nationality ?? null,
      photo: item?.player?.photo ?? null,
      team: item?.statistics?.[0]?.team?.name ?? null,
      position: item?.statistics?.[0]?.games?.position ?? null,
    }))

    return NextResponse.json({ suggestions, source: "live" })
  } catch (err) {
    console.error("Player search error:", err)
    return NextResponse.json({ suggestions: FALLBACK, source: "fallback" })
  }
}
