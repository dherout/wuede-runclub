import { useState } from 'react'
import type { FormEvent } from 'react'
import { useVault } from '@app/providers/vault-provider'

export function UnlockPrompt() {
  const { unlock, error, loading } = useVault()
  const [pass, setPass] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await unlock(pass)
    } catch {
      // error message is in vault state
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-400">
        Lade Daten…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl"
      >
        <div>
          <h1 className="text-xl font-semibold">Wüde Runclub</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Passwort eingeben, um die Statistiken zu entschlüsseln.
          </p>
        </div>
        <input
          type="password"
          autoFocus
          value={pass}
          onChange={e => setPass(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy || !pass}
          className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-orange-400 disabled:opacity-50"
        >
          {busy ? 'Entschlüssle…' : 'Entsperren'}
        </button>
      </form>
    </div>
  )
}
