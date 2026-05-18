import { Link } from '@tanstack/react-router'
import { perAthleteTotals } from '@entities/activity/model/aggregate'
import { formatDistance, formatDuration, formatNumber } from '@shared/lib/format'
import type { ClubActivity } from '@entities/activity/model/types'

export function LeaderboardTable({ activities }: { activities: ClubActivity[] }) {
  const rows = perAthleteTotals(activities)
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <div className="border-b border-neutral-800 px-5 py-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
          Gesamt
        </h2>
      </div>
      <table className="w-full table-fixed text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-400">
            <th className="hidden truncate px-2 py-3 sm:table-cell sm:px-5">#</th>
            <th className="px-2 py-3 sm:px-5">Athlet:in</th>
            <th className="truncate px-2 py-3 text-right sm:px-5">Distanz</th>
            <th className="hidden truncate px-2 py-3 text-right sm:table-cell sm:px-5">Zeit</th>
            <th className="truncate px-2 py-3 text-right sm:px-5">Aktivitäten</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.slug} className="border-b border-neutral-800 last:border-0 hover:bg-neutral-800/40">
              <td className="hidden truncate px-2 py-3 text-neutral-500 tabular-nums sm:table-cell sm:px-5">{i + 1}</td>
              <td className="px-2 py-3 sm:px-5">
                <Link to="/athletes/$id" params={{ id: r.slug }} className="hover:text-orange-300">
                  {r.name}
                </Link>
              </td>
              <td className="truncate px-2 py-3 text-right tabular-nums sm:px-5">{formatDistance(r.distance)}</td>
              <td className="hidden truncate px-2 py-3 text-right tabular-nums sm:table-cell sm:px-5">{formatDuration(r.duration)}</td>
              <td className="truncate px-2 py-3 text-right tabular-nums sm:px-5">{formatNumber(r.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
