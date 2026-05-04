import type { ReactNode } from 'react'

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="text-xs uppercase tracking-wider text-neutral-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
    </div>
  )
}
