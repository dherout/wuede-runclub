import { useActivities } from '@entities/activity/api/use-activities'
import { totals } from '@entities/activity/model/aggregate'
import { StatCard } from '@shared/ui/stat-card/stat-card'
import { formatDistance, formatDuration, formatElevation } from '@shared/lib/format'
import { WeeklyDistanceChart } from '@widgets/weekly-distance-chart'
import { SportBreakdownChart } from '@widgets/sport-breakdown-chart'

export function OverviewPage() {
  const { data } = useActivities()
  if (!data) return null
  const t = totals(data)

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
        Noch keine Aktivitäten. Sobald die GitHub-Action zum ersten Mal Daten holt, erscheinen hier Statistiken.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Aktivitäten" value={t.count} />
        <StatCard label="Distanz" value={formatDistance(t.distance)} />
        <StatCard label="Bewegungszeit" value={formatDuration(t.duration)} />
        <StatCard label="Höhenmeter" value={formatElevation(t.elevation)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyDistanceChart activities={data} />
        <SportBreakdownChart activities={data} />
      </div>
    </div>
  )
}
