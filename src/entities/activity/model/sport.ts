import type { ClubActivity } from './types'

export const RUN_SPORT_TYPES: ReadonlySet<string> = new Set(['Run', 'TrailRun', 'VirtualRun'])

export const SPORT_FILTER_ALL = 'all'
export const SPORT_FILTER_ALL_RUNS = 'all-runs'

export function filterBySport(activities: ClubActivity[], value: string): ClubActivity[] {
  if (value === SPORT_FILTER_ALL) return activities
  if (value === SPORT_FILTER_ALL_RUNS) return activities.filter(a => RUN_SPORT_TYPES.has(a.sport_type))
  return activities.filter(a => a.sport_type === value)
}

export function uniqueSportTypes(activities: ClubActivity[]): string[] {
  const set = new Set(activities.map(a => a.sport_type))
  return Array.from(set).sort()
}
