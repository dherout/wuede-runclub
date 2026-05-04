export interface ClubActivity {
  /** Synthetic stable key — see lib/dedupe.ts */
  key: string
  athlete: { firstname: string; lastname: string }
  name: string
  sport_type: string
  /** metres */
  distance: number
  /** seconds */
  moving_time: number
  /** seconds */
  elapsed_time: number
  /** metres */
  total_elevation_gain: number
  /** ISO timestamp when this entry was first observed */
  first_seen_at: string
  /** Optional: present if the source had it */
  start_date?: string
  /** Optional flag for entries imported from the legacy file */
  migrated?: true
}
