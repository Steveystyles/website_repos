"use client"

type LeagueRow = {
  position: number
  teamId: string
  teamName: string
  won: number
  lost: number
  goalDifference: number
  points: number
  crest: string // ✅ ADD THIS
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
    <div className="rounded-xl border border-smfc-grey bg-smfc-black shadow-lg shadow-black/30 overflow-hidden">
      {/* Header */}
      <div className="relative bg-smfc-charcoal px-4 py-3">
        <div className="absolute left-0 top-0 h-[3px] w-full bg-smfc-red" />
        <h3 className="text-lg font-bold tracking-wide text-smfc-white">
          {leagueName} Table
        </h3>
      </div>

      {/* Rows */}
      <div className="divide-y divide-smfc-grey">
        {rows.map((row) => {
          const isActive = row.teamId === selectedTeamId

          return (
            <button
              key={row.teamId}
              type="button"
              onClick={() => onSelectTeam(row.teamId)}
              className={`
                w-full text-left px-4 py-3
                flex items-center justify-between gap-3
                transition-colors duration-150
                ${isActive
                  ? "bg-smfc-charcoal"
                  : "hover:bg-smfc-charcoal/60"}
              `}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 text-sm text-neutral-400">
                  {row.position}
                </span>
                <img
                  src={row.crest}
                  alt=""
                  className="h-6 w-6"
                  loading="lazy"
                />
                <span className="truncate font-semibold text-smfc-white">
                  {row.teamName}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-neutral-300">
                <span className="inline-flex items-center gap-1 text-neutral-400">
                  <span className="text-neutral-200">W</span>
                  <span>{row.won}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-400">
                  <span className="text-neutral-200">L</span>
                  <span>{row.lost}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-400">
                  <span className="text-neutral-200">GD</span>
                  <span>
                    {row.goalDifference > 0 ? "+" : ""}
                    {row.goalDifference}
                  </span>
                </span>
                <span className="text-lg font-bold text-smfc-white min-w-[36px] text-right">
                  {row.points}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
