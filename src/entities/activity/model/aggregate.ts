import { startOfWeek, format } from 'date-fns'
import type { ClubActivity } from './types'

export type MonthlyByAthleteRow = { month: string } & Record<string, number | string>

export function monthlyByAthlete(activities: ClubActivity[]): {
  rows: MonthlyByAthleteRow[]
  athletes: string[]
} {
  const monthMap = new Map<string, Map<string, number>>()
  const totalsByAthlete = new Map<string, number>()

  for (const a of activities) {
    const ts = a.start_date ?? a.first_seen_at
    const month = format(new Date(ts), 'yyyy-MM')
    const name = `${a.athlete.firstname} ${a.athlete.lastname}`.trim()

    const inner = monthMap.get(month) ?? new Map<string, number>()
    inner.set(name, (inner.get(name) ?? 0) + a.distance)
    monthMap.set(month, inner)

    totalsByAthlete.set(name, (totalsByAthlete.get(name) ?? 0) + a.distance)
  }

  const athletes = Array.from(totalsByAthlete.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  const months = Array.from(monthMap.keys()).sort()
  const rows: MonthlyByAthleteRow[] = months.map(month => {
    const inner = monthMap.get(month)!
    const row: MonthlyByAthleteRow = { month }
    for (const name of athletes) {
      row[name] = +((inner.get(name) ?? 0) / 1000).toFixed(1)
    }
    return row
  })

  return { rows, athletes }
}

export interface WeeklyTotal {
  weekStart: string
  distance: number
  duration: number
  count: number
}

export function groupByWeek(activities: ClubActivity[]): WeeklyTotal[] {
  const buckets = new Map<string, WeeklyTotal>()
  for (const a of activities) {
    const ts = a.start_date ?? a.first_seen_at
    const weekStart = format(startOfWeek(new Date(ts), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const cur = buckets.get(weekStart) ?? { weekStart, distance: 0, duration: 0, count: 0 }
    cur.distance += a.distance
    cur.duration += a.moving_time
    cur.count += 1
    buckets.set(weekStart, cur)
  }
  return Array.from(buckets.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

export interface AthleteTotal {
  name: string
  slug: string
  distance: number
  duration: number
  count: number
}

export function perAthleteTotals(activities: ClubActivity[]): AthleteTotal[] {
  const map = new Map<string, AthleteTotal>()
  for (const a of activities) {
    const name = `${a.athlete.firstname} ${a.athlete.lastname}`.trim()
    const slug = `${a.athlete.firstname}-${a.athlete.lastname}`.toLowerCase().trim()
    const cur = map.get(name) ?? { name, slug, distance: 0, duration: 0, count: 0 }
    cur.distance += a.distance
    cur.duration += a.moving_time
    cur.count += 1
    map.set(name, cur)
  }
  return Array.from(map.values()).sort((a, b) => b.distance - a.distance)
}

export interface SportTotal {
  sport: string
  distance: number
  count: number
}

export function sportBreakdown(activities: ClubActivity[]): SportTotal[] {
  const map = new Map<string, SportTotal>()
  for (const a of activities) {
    const cur = map.get(a.sport_type) ?? { sport: a.sport_type, distance: 0, count: 0 }
    cur.distance += a.distance
    cur.count += 1
    map.set(a.sport_type, cur)
  }
  return Array.from(map.values()).sort((a, b) => b.distance - a.distance)
}

export interface Totals {
  count: number
  distance: number
  duration: number
  elevation: number
}

export function totals(activities: ClubActivity[]): Totals {
  let distance = 0, duration = 0, elevation = 0
  for (const a of activities) {
    distance += a.distance
    duration += a.moving_time
    elevation += a.total_elevation_gain
  }
  return { distance, duration, elevation, count: activities.length }
}
