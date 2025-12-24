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
      <div className="divide-y divide-smfc-grey max-h-96 overflow-y-auto">
        {rows.map((row) => {
          const isActive = row.teamId === selectedTeamId

          return (
            <button
              key={row.teamId}
              type="button"
              onClick={() => onSelectTeam(row.teamId)}
              className={`
                w-full text-left px-4 py-3
                flex flex-col gap-1
                transition-colors duration-150
                ${isActive
                  ? "bg-smfc-charcoal"
                  : "hover:bg-smfc-charcoal/60"}
              `}
            >
              {/* Top line */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 text-sm text-neutral-400">
                    {row.position}
                  </span>
                  <img
                    src={row.crest}
                    alt=""
                    className="h-5 w-5"
                    loading="lazy"
                  />
                  <span className="truncate font-semibold text-smfc-white">
                    {row.teamName}
                  </span>
                </div>

                <span className="text-lg font-bold text-smfc-white">
                  {row.points}
                </span>
              </div>

              {/* Stats line */}
              <div className="flex gap-4 text-xs text-neutral-400 pl-7">
                <span>
                  <strong className="text-neutral-200">W</strong> {row.won}
                </span>
                <span>
                  <strong className="text-neutral-200">L</strong> {row.lost}
                </span>
                <span>
                  <strong className="text-neutral-200">GD</strong>{" "}
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
