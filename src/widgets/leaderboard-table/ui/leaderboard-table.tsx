import { Link } from '@tanstack/react-router'
import { perAthleteTotals } from '@entities/activity/model/aggregate'
import { formatDistance, formatDuration } from '@shared/lib/format'
import type { ClubActivity } from '@entities/activity/model/types'

export function LeaderboardTable({ activities }: { activities: ClubActivity[] }) {
  const rows = perAthleteTotals(activities)
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-400">
            <th className="px-5 py-3">#</th>
            <th className="px-5 py-3">Athlet:in</th>
            <th className="px-5 py-3 text-right">Distanz</th>
            <th className="px-5 py-3 text-right">Zeit</th>
            <th className="px-5 py-3 text-right">Aktivitäten</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.slug} className="border-b border-neutral-800 last:border-0 hover:bg-neutral-800/40">
              <td className="px-5 py-3 text-neutral-500 tabular-nums">{i + 1}</td>
              <td className="px-5 py-3">
                <Link to="/athletes/$id" params={{ id: r.slug }} className="hover:text-orange-300">
                  {r.name}
                </Link>
              </td>
              <td className="px-5 py-3 text-right tabular-nums">{formatDistance(r.distance)}</td>
              <td className="px-5 py-3 text-right tabular-nums">{formatDuration(r.duration)}</td>
              <td className="px-5 py-3 text-right tabular-nums">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
