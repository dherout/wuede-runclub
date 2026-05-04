import { useMemo, useState } from 'react'
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { format } from 'date-fns'
import type { ClubActivity } from '@entities/activity/model/types'

const COLORS = [
  '#fb923c', '#60a5fa', '#a3e635', '#f472b6', '#facc15',
  '#a78bfa', '#34d399', '#22d3ee', '#fb7185', '#c084fc',
]

interface Point {
  distance: number
  pace: number
  elevation: number
  name: string
  athlete: string
  sport_type: string
}

function paceMinPerKm(a: ClubActivity): number {
  if (a.distance < 500) return NaN
  return (a.moving_time / 60) / (a.distance / 1000)
}

function monthOf(a: ClubActivity): string {
  const ts = a.start_date ?? a.first_seen_at
  return format(new Date(ts), 'yyyy-MM')
}

interface TooltipPayloadEntry { payload: Point }

export function PerformancePlot({ activities }: { activities: ClubActivity[] }) {
  const months = useMemo(() => {
    const set = new Set(activities.map(monthOf))
    return Array.from(set).sort().reverse()
  }, [activities])

  const [month, setMonth] = useState<string>(months[0] ?? '')

  const seriesByAthlete = useMemo(() => {
    const filtered = activities.filter(a => monthOf(a) === month)
    const groups = new Map<string, Point[]>()
    for (const a of filtered) {
      const p = paceMinPerKm(a)
      if (!isFinite(p)) continue
      const athlete = `${a.athlete.firstname} ${a.athlete.lastname}`.trim()
      const list = groups.get(athlete) ?? []
      list.push({
        distance: +(a.distance / 1000).toFixed(2),
        pace: +p.toFixed(2),
        elevation: a.total_elevation_gain,
        name: a.name,
        athlete,
        sport_type: a.sport_type,
      })
      groups.set(athlete, list)
    }
    return Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length)
  }, [activities, month])

  if (months.length === 0) return null

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
          Performance — {month}
        </h2>
        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200"
        >
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis
              type="number" dataKey="distance" name="Distanz" unit=" km"
              stroke="#737373" fontSize={11}
            />
            <YAxis
              type="number" dataKey="pace" name="Pace" unit=" min/km" reversed
              stroke="#737373" fontSize={11}
              domain={['auto', 'auto']}
            />
            <ZAxis type="number" dataKey="elevation" range={[40, 400]} name="Höhenmeter" unit=" m" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = (payload[0] as unknown as TooltipPayloadEntry).payload
                return (
                  <div className="rounded border border-neutral-700 bg-neutral-900 p-2 text-xs">
                    <div className="font-medium text-neutral-100">{p.name || '(ohne Titel)'}</div>
                    <div className="text-neutral-400">{p.athlete} · {p.sport_type}</div>
                    <div className="mt-1 text-neutral-300">
                      {p.distance.toFixed(2)} km · {p.pace.toFixed(2)} min/km · {Math.round(p.elevation)} hm
                    </div>
                  </div>
                )
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {seriesByAthlete.map(([athlete, points], i) => (
              <Scatter
                key={athlete}
                name={athlete}
                data={points}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.7}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Y-Achse umgekehrt: Punkte oben = schnellere Pace. Bubble-Größe = Höhenmeter.
      </p>
    </div>
  )
}
