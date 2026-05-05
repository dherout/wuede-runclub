import { sha256Hex } from '@shared/lib/hash'

export interface KeyInput {
  athlete: { firstname: string; lastname: string }
  sport_type: string
  distance: number
  moving_time: number
}

/**
 * Synthetic key for an activity. We deliberately exclude `name` because:
 *   - Strava names are athlete-typed and editable after upload, so they shift over
 *     time — including them makes the key unstable and produces phantom duplicates
 *     when the cron re-fetches the same activity later.
 *   - The historical migration source had whitespace-stripped names, so its keys
 *     didn't match the live API anyway.
 *
 * Athlete + sport_type + distance(m) + moving_time(s) is unique enough in practice;
 * the rare collision (same athlete repeating an identical training twice in a window)
 * collapses, which is acceptable for club aggregates.
 */
export async function activityKey(a: KeyInput): Promise<string> {
  const norm = [
    a.athlete.firstname.trim().toLowerCase(),
    a.athlete.lastname.trim().toLowerCase(),
    a.sport_type,
    Math.round(a.distance),
    Math.round(a.moving_time),
  ].join('|')
  return (await sha256Hex(norm)).slice(0, 16)
}
