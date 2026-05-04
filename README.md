# wuede-runclub

Strava-Statistiken vom Wüde Runclub. React + Vite + TypeScript app deployed to GitHub Pages, with activity data encrypted at rest in this public repo and decrypted in the browser via a shared passphrase.

## Architecture

A scheduled GitHub Action polls the Strava Club Activities API hourly, merges new activities into an AES-256-GCM-encrypted JSON file (`public/data/activities.enc.json`), and commits it. The same repo is built and deployed to GitHub Pages via a second workflow. Visitors enter the shared passphrase once per session to decrypt the data client-side.

See `.plans/this-is-a-brand-melodic-pascal.md` for the full design rationale.

## Stack

- Vite 6 + React 19 + TypeScript
- TanStack Router (file-based routing, hash history)
- Recharts
- Tailwind v4
- Feature-Sliced Design layout under `src/` (`app/pages/widgets/features/entities/shared`)

## Local development

```bash
# 1. install
npm ci

# 2. bootstrap an empty encrypted vault using a dev passphrase (only needed once,
#    or whenever you want to reset). Pick any passphrase for local dev.
STRAVA_DATA_PASSPHRASE='dev' npm run migrate

# 3. (optional) import historical data
cp '~/Dropbox/Eigene Dokumente/laufstatistiken-2026.json' scripts/.import/
STRAVA_DATA_PASSPHRASE='dev' npm run migrate

# 4. dev server
npm run dev
```

Open http://localhost:5173/wuede-runclub/ and enter the same passphrase you used in step 2/3 to unlock.

`scripts/.import/` and `.env.local` are gitignored.

## GitHub setup

1. Create a Strava API app at https://www.strava.com/settings/api → note `client_id`, `client_secret`.
2. Have a club admin/member do the OAuth code flow once with scope `read,activity:read` to obtain a long-lived `refresh_token`.
3. In repo settings → Secrets and variables → Actions, add:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `STRAVA_REFRESH_TOKEN`
   - `STRAVA_CLUB_ID`
   - `STRAVA_DATA_PASSPHRASE` — strong shared passphrase (≥ 5 random words). Distribute to club members out-of-band.
4. Repo settings → Pages → Source: GitHub Actions.
5. Run `fetch-strava` workflow once via "Run workflow" to bootstrap real data; `deploy-pages` will follow automatically when the data commit lands.

## Rotating the passphrase

```bash
STRAVA_DATA_PASSPHRASE_OLD='current' STRAVA_DATA_PASSPHRASE='new strong passphrase' npm run rekey
git commit -am "data: rekey vault"
git push
```

Then update the `STRAVA_DATA_PASSPHRASE` GitHub secret to the new value and notify club members.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview built bundle
- `npm run typecheck` — TypeScript check
- `npm run migrate` — import historical JSON / bootstrap empty vault (needs `STRAVA_DATA_PASSPHRASE`)
- `npm run fetch-strava` — manual run of the Strava cron locally (needs all `STRAVA_*` envs)
- `npm run rekey` — rotate vault passphrase (needs `STRAVA_DATA_PASSPHRASE_OLD` + `STRAVA_DATA_PASSPHRASE`)

## Threat model & limits

- The encrypted file is publicly visible; only the contents are protected. Update cadence and ciphertext size leak that the club is active.
- One shared passphrase = one access tier. No per-user revocation; rotate to evict.
- The Strava Club Activities endpoint omits stable IDs, so dedupe uses a synthetic key over `(athlete name, distance, moving time, sport_type, name)`. Two activities with identical fields will collapse into one — acceptable for club aggregates.
