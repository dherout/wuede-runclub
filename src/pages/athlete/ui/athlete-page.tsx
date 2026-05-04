import { useActivities } from '@entities/activity/api/use-activities'
import { totals } from '@entities/activity/model/aggregate'
import { StatCard } from '@shared/ui/stat-card/stat-card'
import { formatDistance, formatDuration, formatElevation } from '@shared/lib/format'

export function AthletePage({ id }: { id: string }) {
  const { data } = useActivities()
  if (!data) return null
  const target = id.toLowerCase()
  const filtered = data.filter(
    a => `${a.athlete.firstname}-${a.athlete.lastname}`.toLowerCase() === target,
  )
  const t = totals(filtered)
  const name = filtered[0]
    ? `${filtered[0].athlete.firstname} ${filtered[0].athlete.lastname}`.trim()
    : id
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{name}</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Aktivitäten" value={t.count} />
        <StatCard label="Distanz" value={formatDistance(t.distance)} />
        <StatCard label="Bewegungszeit" value={formatDuration(t.duration)} />
        <StatCard label="Höhenmeter" value={formatElevation(t.elevation)} />
      </div>
    </div>
  )
}
