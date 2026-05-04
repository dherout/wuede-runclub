import { useActivities } from '@entities/activity/api/use-activities'
import { PerformancePlot } from '@widgets/performance-plot'

export function PerformancePage() {
  const { data } = useActivities()
  if (!data) return null
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Leistung</h1>
      <PerformancePlot activities={data} />
    </div>
  )
}
