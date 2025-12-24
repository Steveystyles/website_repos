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

      {/* Column headings */}
      <div className="bg-smfc-black/70 border-b border-smfc-grey/70 text-[11px] uppercase tracking-wide text-neutral-400">
        <div className="grid grid-cols-[50px,1fr,60px,60px,70px,70px] items-center px-4 py-2">
          <span className="text-center">Pos</span>
          <span className="text-left">Team</span>
          <span className="text-center">W</span>
          <span className="text-center">L</span>
          <span className="text-center">GD</span>
          <span className="text-center">Pts</span>
        </div>
      </div>

      {/* Rows */}
      <div className="max-h-96 overflow-y-auto divide-y divide-smfc-grey">
        {rows.map((row) => {
          const isActive = row.teamId === selectedTeamId

          return (
            <button
              key={row.teamId}
              type="button"
              onClick={() => onSelectTeam(row.teamId)}
              className={`
                grid grid-cols-[50px,1fr,60px,60px,70px,70px] items-center
                w-full text-left px-4 py-3 gap-2
                transition-colors duration-150
                ${isActive
                  ? "bg-smfc-charcoal"
                  : "hover:bg-smfc-charcoal/60"}
              `}
            >
              <span className="text-sm font-semibold text-neutral-200 text-center">
                {row.position}
              </span>

              <div className="flex items-center gap-3 min-w-0">
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

              <span className="text-sm text-neutral-200 text-center font-semibold">
                {row.won}
              </span>
              <span className="text-sm text-neutral-200 text-center font-semibold">
                {row.lost}
              </span>
              <span className="text-sm text-neutral-200 text-center font-semibold">
                {row.goalDifference > 0 ? "+" : ""}
                {row.goalDifference}
              </span>
              <span className="text-lg font-bold text-smfc-white text-center">
                {row.points}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
