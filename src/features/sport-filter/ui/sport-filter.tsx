import { useMemo, useState, type ReactNode } from 'react'
import {
  filterBySport,
  uniqueSportTypes,
  SPORT_FILTER_ALL,
  SPORT_FILTER_ALL_RUNS,
} from '@entities/activity/model/sport'
import type { ClubActivity } from '@entities/activity/model/types'

export interface SportFilter {
  filtered: ClubActivity[]
  control: ReactNode
}

export function useSportFilter(activities: ClubActivity[]): SportFilter {
  const [value, setValue] = useState<string>(SPORT_FILTER_ALL_RUNS)

  const sports = useMemo(() => uniqueSportTypes(activities), [activities])
  const filtered = useMemo(() => filterBySport(activities, value), [activities, value])

  const control = (
    <select
      value={value}
      onChange={e => setValue(e.target.value)}
      className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200"
    >
      <option value={SPORT_FILTER_ALL_RUNS}>Alle Läufe</option>
      <option value={SPORT_FILTER_ALL}>Alle Sportarten</option>
      {sports.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  )

  return { filtered, control }
}
