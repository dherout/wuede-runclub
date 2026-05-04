/**
 * Rotate the encryption passphrase.
 *
 * Usage:
 *   STRAVA_DATA_PASSPHRASE_OLD='…' STRAVA_DATA_PASSPHRASE='…' npm run rekey
 *
 * Decrypts the existing vault with the OLD passphrase, re-encrypts with the NEW one.
 * After running locally, commit the change AND update the STRAVA_DATA_PASSPHRASE GitHub secret.
 */
import { decrypt } from '../src/shared/lib/vault.ts'
import type { ClubActivity } from '../src/entities/activity/model/types.ts'
import { readVault, writeVault } from './lib/io.ts'

async function main() {
  const oldPass = process.env.STRAVA_DATA_PASSPHRASE_OLD
  const newPass = process.env.STRAVA_DATA_PASSPHRASE
  if (!oldPass || !newPass) {
    console.error('Both STRAVA_DATA_PASSPHRASE_OLD and STRAVA_DATA_PASSPHRASE must be set.')
    process.exit(1)
  }
  if (oldPass === newPass) {
    console.error('OLD and NEW passphrases are identical — nothing to do.')
    process.exit(1)
  }

  const envelope = await readVault()
  if (!envelope) {
    console.error('No vault file found at public/data/activities.enc.json')
    process.exit(1)
  }

  const json = await decrypt(envelope, oldPass)
  const activities = JSON.parse(json) as ClubActivity[]
  await writeVault(activities, newPass)
  console.log(`rekeyed ${activities.length} activities`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
