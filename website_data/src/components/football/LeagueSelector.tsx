"use client"

type League = {
  id: string
  name: string
  season: string
}

type Props = {
  value: string
  onChange: (leagueId: string, season: string) => void
}

const LEAGUES: League[] = [
  {
    id: "4328",
    name: "Scottish Premiership",
    season: "2024-2025",
  },
  {
    id: "4329",
    name: "Scottish Championship",
    season: "2024-2025",
  },
]

export default function LeagueSelector({ value, onChange }: Props) {
  return (
    <div className="rounded-xl border border-smfc-grey bg-smfc-charcoal p-4 shadow-lg shadow-black/30">
      <label className="block text-sm font-semibold text-neutral-300 mb-2">
        Select League
      </label>

      <select
        value={value}
        onChange={(e) => {
          const league = LEAGUES.find((l) => l.id === e.target.value)
          if (league) onChange(league.id, league.season)
        }}
        className="w-full rounded-lg bg-smfc-black border border-smfc-grey p-2 text-smfc-white"
      >
        {LEAGUES.map((league) => (
          <option key={league.id} value={league.id}>
            {league.name}
          </option>
        ))}
      </select>
    </div>
  )
}
