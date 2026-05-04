import { useVault } from '@app/providers/vault-provider'

export function useActivities() {
  const v = useVault()
  return { data: v.data, loading: v.loading, error: v.error, locked: v.locked }
}
