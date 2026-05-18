import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { groupByWeek } from '@entities/activity/model/aggregate'
import { formatNumber } from '@shared/lib/format'
import type { ClubActivity } from '@entities/activity/model/types'

export function WeeklyDistanceChart({ activities }: { activities: ClubActivity[] }) {
  const data = groupByWeek(activities).map(w => ({
    week: w.weekStart,
    km: +(w.distance / 1000).toFixed(2),
  }))

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-400">
        Wöchentliche Distanz
      </h2>
      <div className="aspect-[3/2] max-h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="week" stroke="#737373" fontSize={11} />
            <YAxis stroke="#737373" fontSize={11} unit=" km" tickFormatter={v => formatNumber(v as number, 2)} />
            <Tooltip
              contentStyle={{ background: '#171717', border: '1px solid #404040', fontSize: 12 }}
              formatter={(v) => [`${formatNumber(v as number, 2)} km`, 'km']}
            />
            <Line type="monotone" dataKey="km" stroke="#fb923c" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
