import { useVault } from '@app/providers/vault-provider'

export function RelockButton() {
  const { lock } = useVault()
  return (
    <button
      onClick={lock}
      className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-400 hover:text-white"
    >
      Sperren
    </button>
  )
}
