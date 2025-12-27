"use client"

import Image from "next/image"

type LeagueRow = {
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

type Props = {
  leagueName: string
  rows: LeagueRow[]
  selectedTeamId?: string
  onSelectTeam: (teamId: string) => void
}

export default function LeagueTable({
  leagueName,
  rows,
  selectedTeamId,
  onSelectTeam,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-smfc-grey/70 bg-smfc-black shadow-lg shadow-black/30">
      <div className="flex flex-col gap-1 border-b border-smfc-grey/60 bg-smfc-charcoal/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-smfc-red">
            Standings
          </p>
          <h3 className="text-lg font-bold tracking-wide text-smfc-white">
            {leagueName} Table
          </h3>
        </div>
        <p className="text-xs text-neutral-400 sm:text-right">
          Tap a row to see the full team snapshot
        </p>
      </div>

      <div className="divide-y divide-smfc-grey/40 overflow-y-auto max-h-[70vh]">
        {rows.map((row) => {
          const isActive = row.teamId === selectedTeamId

          return (
            <button
              key={row.teamId}
              type="button"
              onClick={() => onSelectTeam(row.teamId)}
              className={`
                w-full px-4 py-4 sm:px-5
                transition-colors duration-150 text-center
                ${isActive
                  ? "bg-smfc-charcoal/80 ring-1 ring-inset ring-smfc-red/60"
                  : "hover:bg-smfc-charcoal/60"}
              `}
            >
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <div className="flex items-center justify-center gap-3 sm:min-w-0">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-smfc-black text-sm font-bold text-neutral-100 ${isActive ? "border-smfc-red/80 text-smfc-white" : "border-smfc-grey/70"}`}
                  >
                    {row.position}
                  </span>

                  <Image
                    src={row.crest || "/crest.svg"}
                    alt={`${row.teamName} badge`}
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full bg-smfc-black object-contain"
                    loading="lazy"
                  />

                  <div className="min-w-0 text-left sm:text-center">
                    <p className="truncate text-base font-semibold text-smfc-white flex items-center gap-2">
                      {row.teamName}
                      <span className="text-[10px] rounded-full bg-smfc-red/20 px-2 py-[2px] text-smfc-red">
                        {row.points} pts
                      </span>
                    </p>
                  </div>
                </div>

                <div className="hidden min-w-[320px] shrink-0 grid grid-cols-6 gap-3 text-center sm:grid">
                  {[
                    { label: "P", value: row.played },
                    { label: "W", value: row.won },
                    { label: "D", value: row.drawn },
                    { label: "L", value: row.lost },
                    { label: "GF", value: row.goalsFor },
                    { label: "GA", value: row.goalsAgainst },
                    {
                      label: "GD",
                      value: `${row.goalDifference > 0 ? "+" : ""}${row.goalDifference}`,
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-smfc-black/70 px-3 py-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                        {stat.label}
                      </p>
                      <p className="text-base font-semibold text-smfc-white">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
                {[
                  { label: "P", value: row.played },
                  { label: "Pts", value: row.points },
                  { label: "W", value: row.won },
                  { label: "D", value: row.drawn },
                  { label: "L", value: row.lost },
                  {
                    label: "GD",
                    value: `${row.goalDifference > 0 ? "+" : ""}${row.goalDifference}`,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-lg bg-smfc-charcoal/80 px-3 py-2 text-sm font-semibold text-smfc-white"
                  >
                    <span className="text-[11px] uppercase tracking-wide text-neutral-400">
                      {stat.label}
                    </span>
                    <span>{stat.value}</span>
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
