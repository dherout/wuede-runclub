import type { ReactNode } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { monthlyByAthlete } from '@entities/activity/model/aggregate'
import { formatNumber } from '@shared/lib/format'
import type { ClubActivity } from '@entities/activity/model/types'

const COLORS = [
  '#fb923c', '#60a5fa', '#a3e635', '#f472b6', '#facc15',
  '#a78bfa', '#34d399', '#22d3ee', '#fb7185', '#c084fc',
]

export function MonthlyLeaderboardChart({ activities, control }: { activities: ClubActivity[]; control?: ReactNode }) {
  const { rows, athletes } = monthlyByAthlete(activities)

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
          Monatliches Ranking (km)
        </h2>
        {control}
      </div>
      <div className="aspect-[3/2] max-h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="month" stroke="#737373" fontSize={11} />
            <YAxis stroke="#737373" fontSize={11} unit=" km" tickFormatter={v => formatNumber(v as number, 2)} />
            <Tooltip
              contentStyle={{ background: '#171717', border: '1px solid #404040', fontSize: 12 }}
              formatter={(v) => [`${formatNumber(v as number, 2)} km`, '']}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {athletes.map((name, i) => (
              <Bar key={name} dataKey={name} stackId="km" fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
