import { useActivities } from '@entities/activity/api/use-activities'
import { LeaderboardTable } from '@widgets/leaderboard-table'
import { MonthlyLeaderboardChart } from '@widgets/monthly-leaderboard-chart'

export function LeaderboardPage() {
  const { data } = useActivities()
  if (!data) return null
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Bestenliste</h1>
      <MonthlyLeaderboardChart activities={data} />
      <LeaderboardTable activities={data} />
    </div>
  )
}
