import { useActivities } from '@entities/activity/api/use-activities'
import { useSportFilter } from '@features/sport-filter'
import { LeaderboardTable } from '@widgets/leaderboard-table'
import { MonthlyLeaderboardChart } from '@widgets/monthly-leaderboard-chart'

export function LeaderboardPage() {
  const { data } = useActivities()
  const { filtered, control } = useSportFilter(data ?? [])
  if (!data) return null
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Bestenliste</h1>
      <MonthlyLeaderboardChart activities={filtered} control={control} />
      <LeaderboardTable activities={filtered} />
    </div>
  )
}
