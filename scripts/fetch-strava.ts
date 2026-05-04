/**
 * Polls Strava's club activities endpoint, merges with the existing encrypted vault,
 * re-encrypts, and writes back. Designed to run on a timely basis via GitHub Actions.
 */
import { activityKey } from '../src/entities/activity/lib/dedupe.ts'
import type { ClubActivity } from '../src/entities/activity/model/types.ts'
import { decrypt } from '../src/shared/lib/vault.ts'
import { readVault, writeVault, requirePassphrase } from './lib/io.ts'

interface StravaTokenResponse {
  access_token: string
  expires_at: number
  refresh_token: string
}

interface StravaClubActivity {
  athlete: { firstname: string; lastname: string }
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  sport_type: string
  type?: string
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(`${name} not set`)
    process.exit(1)
  }
  return v
}

async function refreshAccessToken(): Promise<string> {
  const res = await fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: requireEnv('STRAVA_CLIENT_ID'),
      client_secret: requireEnv('STRAVA_CLIENT_SECRET'),
      refresh_token: requireEnv('STRAVA_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`token refresh failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as StravaTokenResponse
  return data.access_token
}

async function fetchClubActivities(accessToken: string, clubId: string): Promise<StravaClubActivity[]> {
  const all: StravaClubActivity[] = []
  const perPage = 200
  let page = 1
  while (true) {
    const url = `https://www.strava.com/api/v3/clubs/${clubId}/activities?per_page=${perPage}&page=${page}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (!res.ok) throw new Error(`club activities fetch failed: ${res.status} ${await res.text()}`)
    const batch = (await res.json()) as StravaClubActivity[]
    all.push(...batch)
    if (batch.length < perPage) break
    page++
    if (page > 10) {
      console.warn('safety stop after 10 pages')
      break
    }
  }
  return all
}

async function toClubActivity(raw: StravaClubActivity, now: string): Promise<ClubActivity> {
  const partial: Omit<ClubActivity, 'key'> = {
    athlete: { firstname: raw.athlete.firstname, lastname: raw.athlete.lastname },
    name: raw.name,
    sport_type: raw.sport_type ?? raw.type ?? 'Run',
    distance: raw.distance,
    moving_time: raw.moving_time,
    elapsed_time: raw.elapsed_time,
    total_elevation_gain: raw.total_elevation_gain,
    first_seen_at: now,
  }
  return { ...partial, key: await activityKey(partial) }
}

async function main() {
  const passphrase = requirePassphrase()
  const clubId = requireEnv('STRAVA_CLUB_ID')

  const existingEnvelope = await readVault()
  const existing: ClubActivity[] = []
  if (existingEnvelope) {
    const json = await decrypt(existingEnvelope, passphrase)
    existing.push(...(JSON.parse(json) as ClubActivity[]))
    console.log(`decrypted ${existing.length} existing activities`)
  }

  const accessToken = await refreshAccessToken()
  const fetched = await fetchClubActivities(accessToken, clubId)
  console.log(`fetched ${fetched.length} activities from Strava`)

  const now = new Date().toISOString()
  const incoming = await Promise.all(fetched.map(r => toClubActivity(r, now)))

  const byKey = new Map<string, ClubActivity>()
  for (const a of existing) byKey.set(a.key, a)
  let added = 0
  for (const a of incoming) {
    if (!byKey.has(a.key)) {
      byKey.set(a.key, a)
      added++
    }
  }

  const merged = Array.from(byKey.values())
  await writeVault(merged, passphrase)
  console.log(`merged ${merged.length} total (${added} new)`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
