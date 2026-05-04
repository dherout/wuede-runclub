import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { groupByWeek } from '@entities/activity/model/aggregate'
import type { ClubActivity } from '@entities/activity/model/types'

export function WeeklyDistanceChart({ activities }: { activities: ClubActivity[] }) {
  const data = groupByWeek(activities).map(w => ({
    week: w.weekStart,
    km: +(w.distance / 1000).toFixed(1),
  }))

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-400">
        Wöchentliche Distanz
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="week" stroke="#737373" fontSize={11} />
            <YAxis stroke="#737373" fontSize={11} unit=" km" />
            <Tooltip contentStyle={{ background: '#171717', border: '1px solid #404040', fontSize: 12 }} />
            <Line type="monotone" dataKey="km" stroke="#fb923c" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
