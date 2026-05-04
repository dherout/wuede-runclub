import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { sportBreakdown } from '@entities/activity/model/aggregate'
import type { ClubActivity } from '@entities/activity/model/types'

const COLORS = ['#fb923c', '#60a5fa', '#a3e635', '#f472b6', '#facc15', '#a78bfa', '#34d399']

export function SportBreakdownChart({ activities }: { activities: ClubActivity[] }) {
  const data = sportBreakdown(activities).map(s => ({
    name: s.sport,
    value: +(s.distance / 1000).toFixed(1),
  }))

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-400">
        Sport-Aufteilung (km)
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#171717', border: '1px solid #404040', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
