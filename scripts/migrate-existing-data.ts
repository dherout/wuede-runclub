/**
 * One-shot import of historical Strava JSON.
 * Reads a source JSON (path passed via --source or default scripts/.import/laufstatistiken-2026.json),
 * maps each entry to ClubActivity, encrypts, writes public/data/activities.enc.json.
 *
 * Usage:
 *   STRAVA_DATA_PASSPHRASE='…' npm run migrate -- --source path/to/file.json
 *   STRAVA_DATA_PASSPHRASE='…' npm run migrate            # uses default path or empty
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { activityKey } from '../src/entities/activity/lib/dedupe.ts'
import type { ClubActivity } from '../src/entities/activity/model/types.ts'
import { writeVault, requirePassphrase, readVault } from './lib/io.ts'
import { decrypt } from '../src/shared/lib/vault.ts'
import { REPO_ROOT } from './lib/data-paths.ts'

interface RawAny {
  [k: string]: unknown
}

/** Looks like a Strava activity object — has athlete + distance + moving_time. */
function looksLikeActivity(v: unknown): v is RawAny {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const o = v as RawAny
  return ('athlete' in o || 'athlete_name' in o) && ('distance' in o || 'distance_km' in o) && ('moving_time' in o || 'moving_time_min' in o || 'moving_time_s' in o)
}

/**
 * Detects a month-keyed dict like `{ "0": [act, …], "1": [act, …], … }` where keys
 * are zero-based month indices (0 = Jan). All keys must be small integers (< 12) and
 * all values must be arrays. This is the historical Strava dump convention.
 */
function isMonthKeyedDict(v: unknown): boolean {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const obj = v as RawAny
  const keys = Object.keys(obj)
  if (keys.length === 0) return false
  if (!keys.every(k => /^\d+$/.test(k) && parseInt(k, 10) >= 0 && parseInt(k, 10) < 12)) return false
  return Object.values(obj).every(val => Array.isArray(val))
}

function detectYear(sourcePath: string): number {
  const match = sourcePath.match(/(\d{4})/)
  if (match) {
    const y = parseInt(match[1], 10)
    if (y >= 2000 && y < 2100) return y
  }
  return new Date().getFullYear()
}

interface FlatEntry { raw: RawAny; start_date?: string }

/**
 * Walks any nesting and yields activity-shaped objects. When a month-keyed dict
 * (see {@link isMonthKeyedDict}) is encountered, the integer key is interpreted as
 * a zero-based month and synthesised onto each contained activity as a midpoint
 * `start_date` (year-MM-15) so downstream aggregations can bucket by month.
 *
 * Accepted shapes include:
 *  - flat array `[ {act}, … ]`
 *  - `{ activities: [ {act}, … ] }`
 *  - `{ activities: [ { "0": [ {act}, … ], "1": [ … ] } ] }`  ← month-keyed Strava dump
 */
function flatten(parsed: unknown, year: number): FlatEntry[] {
  const out: FlatEntry[] = []
  const walk = (v: unknown, monthHint?: number): void => {
    if (Array.isArray(v)) {
      for (const item of v) walk(item, monthHint)
      return
    }
    if (looksLikeActivity(v)) {
      const start_date = monthHint !== undefined
        ? `${year}-${String(monthHint + 1).padStart(2, '0')}-15T12:00:00Z`
        : undefined
      out.push({ raw: v as RawAny, start_date })
      return
    }
    if (isMonthKeyedDict(v)) {
      for (const [k, child] of Object.entries(v as RawAny)) {
        walk(child, parseInt(k, 10))
      }
      return
    }
    if (v && typeof v === 'object') {
      for (const child of Object.values(v as RawAny)) walk(child, monthHint)
    }
  }
  walk(parsed)
  return out
}

function parseArgs(argv: string[]): { source?: string } {
  const args: { source?: string } = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--source') args.source = argv[++i]
  }
  return args
}

function num(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(',', '.'))
    return isNaN(n) ? 0 : n
  }
  return 0
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function splitName(full: string): { firstname: string; lastname: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 0) return { firstname: '', lastname: '' }
  if (parts.length === 1) return { firstname: parts[0], lastname: '' }
  return { firstname: parts[0], lastname: parts.slice(1).join(' ') }
}

/**
 * Defensive mapping — accepts the most common shapes:
 *  - Strava API native: { athlete: {firstname, lastname}, distance (m), moving_time (s), … }
 *  - Strava export: { athlete_name, distance_km, moving_time_min, … }
 *  - Generic: tries common alternates.
 *
 * Tighten this on first read of the actual source file.
 */
async function mapEntry(raw: RawAny, fallbackTimestamp: string): Promise<ClubActivity> {
  let firstname = ''
  let lastname = ''
  if (raw.athlete && typeof raw.athlete === 'object') {
    const a = raw.athlete as RawAny
    firstname = str(a.firstname) || str(a.first_name)
    lastname = str(a.lastname) || str(a.last_name)
  }
  if (!firstname && !lastname) {
    const full = str(raw.athlete_name) || str(raw.athlete) || str(raw.name)
    if (full) {
      const split = splitName(full)
      firstname = split.firstname
      lastname = split.lastname
    }
  }

  const sport_type = str(raw.sport_type) || str(raw.type) || str(raw.sport) || 'Run'
  const name = str(raw.name) || str(raw.title) || ''

  // Distance: prefer metres if numeric > 100, else assume km
  let distance = num(raw.distance ?? raw.distance_m)
  if (!distance) {
    const km = num(raw.distance_km)
    if (km) distance = km * 1000
  }

  // Moving time: prefer seconds if > 60, else assume minutes
  let moving_time = num(raw.moving_time ?? raw.moving_time_s)
  if (!moving_time) {
    const min = num(raw.moving_time_min) || num(raw.moving_minutes)
    if (min) moving_time = min * 60
  }

  let elapsed_time = num(raw.elapsed_time ?? raw.elapsed_time_s)
  if (!elapsed_time) {
    const min = num(raw.elapsed_time_min)
    if (min) elapsed_time = min * 60
  }
  if (!elapsed_time) elapsed_time = moving_time

  const total_elevation_gain = num(raw.total_elevation_gain ?? raw.elevation_gain ?? raw.elevation)

  const start_date = str(raw.start_date) || str(raw.start_date_local) || str(raw.date) || undefined

  const partial: Omit<ClubActivity, 'key'> = {
    athlete: { firstname, lastname },
    name,
    sport_type,
    distance,
    moving_time,
    elapsed_time,
    total_elevation_gain,
    first_seen_at: start_date || fallbackTimestamp,
    start_date,
    migrated: true,
  }
  const key = await activityKey(partial)
  return { ...partial, key }
}

async function main() {
  const passphrase = requirePassphrase()
  const args = parseArgs(process.argv.slice(2))
  const defaultSource = path.join(REPO_ROOT, 'scripts', '.import', 'laufstatistiken-2026.json')
  const sourcePath = args.source ?? defaultSource

  const year = detectYear(sourcePath)
  let raw: RawAny[] = []
  try {
    const text = await fs.readFile(sourcePath, 'utf8')
    const parsed = JSON.parse(text)
    const flat = flatten(parsed, year)
    raw = flat.map(({ raw, start_date }) => start_date ? { ...raw, start_date } : raw)
    console.log(`read ${raw.length} entries from ${sourcePath} (year=${year})`)
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`source not found at ${sourcePath} — initialising empty vault`)
    } else {
      throw err
    }
  }

  // Preserve any already-encrypted entries (idempotent re-runs)
  const existingEnvelope = await readVault()
  const existing: ClubActivity[] = []
  if (existingEnvelope) {
    try {
      const json = await decrypt(existingEnvelope, passphrase)
      existing.push(...(JSON.parse(json) as ClubActivity[]))
      console.log(`merged with ${existing.length} existing entries`)
    } catch {
      console.warn('could not decrypt existing vault with given passphrase — overwriting')
    }
  }

  const fallbackTimestamp = new Date().toISOString()
  const mapped = await Promise.all(raw.map(r => mapEntry(r, fallbackTimestamp)))

  const byKey = new Map<string, ClubActivity>()
  for (const a of existing) byKey.set(a.key, a)
  for (const a of mapped) {
    const prior = byKey.get(a.key)
    if (prior) {
      // keep earlier first_seen_at
      byKey.set(a.key, { ...a, first_seen_at: prior.first_seen_at, migrated: prior.migrated ?? a.migrated })
    } else {
      byKey.set(a.key, a)
    }
  }

  const merged = Array.from(byKey.values())
  await writeVault(merged, passphrase)
  console.log(`wrote ${merged.length} activities to public/data/activities.enc.json`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
