import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { decrypt } from '@shared/lib/vault'
import type { VaultEnvelope } from '@shared/lib/vault'
import { BASE_URL } from '@shared/config/base-path'
import type { ClubActivity } from '@entities/activity/model/types'

const SS_KEY = 'wuede:passphrase'
const ACTIVITIES_URL = `${BASE_URL}data/activities.enc.json`

interface VaultState {
  loading: boolean
  envelope?: VaultEnvelope
  data?: ClubActivity[]
  error?: string
  locked: boolean
}

interface VaultActions {
  unlock: (passphrase: string) => Promise<void>
  lock: () => void
}

const VaultContext = createContext<(VaultState & VaultActions) | null>(null)

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within VaultProvider')
  return ctx
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VaultState>({ loading: true, locked: true })

  useEffect(() => {
    let cancelled = false
    fetch(ACTIVITIES_URL)
      .then(r => {
        if (!r.ok) throw new Error(`failed to fetch encrypted data: ${r.status}`)
        return r.json() as Promise<VaultEnvelope>
      })
      .then(async envelope => {
        if (cancelled) return
        const stored = sessionStorage.getItem(SS_KEY)
        if (stored) {
          try {
            const json = await decrypt(envelope, stored)
            if (cancelled) return
            const data = JSON.parse(json) as ClubActivity[]
            setState({ loading: false, envelope, data, locked: false })
            return
          } catch {
            sessionStorage.removeItem(SS_KEY)
          }
        }
        if (!cancelled) setState({ loading: false, envelope, locked: true })
      })
      .catch(err => {
        if (!cancelled) setState({ loading: false, locked: true, error: String(err) })
      })
    return () => { cancelled = true }
  }, [])

  const unlock = async (passphrase: string) => {
    if (!state.envelope) throw new Error('encrypted data not loaded yet')
    try {
      const json = await decrypt(state.envelope, passphrase)
      const data = JSON.parse(json) as ClubActivity[]
      setState(s => ({ ...s, data, locked: false, error: undefined }))
      sessionStorage.setItem(SS_KEY, passphrase)
    } catch {
      setState(s => ({ ...s, error: 'Falsches Passwort' }))
      throw new Error('decryption failed')
    }
  }

  const lock = () => {
    sessionStorage.removeItem(SS_KEY)
    setState(s => ({ ...s, data: undefined, locked: true }))
  }

  return (
    <VaultContext.Provider value={{ ...state, unlock, lock }}>
      {children}
    </VaultContext.Provider>
  )
}
