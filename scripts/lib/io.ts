import fs from 'node:fs/promises'
import path from 'node:path'
import { encrypt, ciphertextDigest } from '../../src/shared/lib/vault.ts'
import type { VaultEnvelope } from '../../src/shared/lib/vault.ts'
import type { ClubActivity } from '../../src/entities/activity/model/types.ts'
import { ACTIVITIES_PATH, META_PATH } from './data-paths.ts'

export interface Meta {
  schemaVersion: number
  lastFetchedAt: string | null
  activityCount: number
  ciphertextDigest: string
}

export async function readVault(): Promise<VaultEnvelope | null> {
  try {
    const raw = await fs.readFile(ACTIVITIES_PATH, 'utf8')
    return JSON.parse(raw) as VaultEnvelope
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

export async function writeVault(activities: ClubActivity[], passphrase: string): Promise<void> {
  const sorted = [...activities].sort((a, b) => a.key.localeCompare(b.key))
  const envelope = await encrypt(JSON.stringify(sorted), passphrase)
  await fs.mkdir(path.dirname(ACTIVITIES_PATH), { recursive: true })
  await fs.writeFile(ACTIVITIES_PATH, JSON.stringify(envelope, null, 2) + '\n', 'utf8')
  const meta: Meta = {
    schemaVersion: 1,
    lastFetchedAt: new Date().toISOString(),
    activityCount: sorted.length,
    ciphertextDigest: await ciphertextDigest(envelope),
  }
  await fs.writeFile(META_PATH, JSON.stringify(meta, null, 2) + '\n', 'utf8')
}

export function requirePassphrase(): string {
  const p = process.env.STRAVA_DATA_PASSPHRASE
  if (!p) {
    console.error('STRAVA_DATA_PASSPHRASE not set. Run with: STRAVA_DATA_PASSPHRASE=… npm run …')
    process.exit(1)
  }
  return p
}
