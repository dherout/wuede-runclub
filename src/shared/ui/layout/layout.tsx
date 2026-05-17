import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { RelockButton } from '@features/relock-button'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/" className="text-base font-semibold tracking-tight">
            Wüde Runclub
          </Link>
          <div className="flex items-center gap-3 text-xs text-neutral-300 sm:gap-6 sm:text-sm">
            <Link to="/" className="hover:text-white" activeProps={{ className: 'text-white' }}>
              Übersicht
            </Link>
            <Link to="/leaderboard" className="hover:text-white" activeProps={{ className: 'text-white' }}>
              Bestenliste
            </Link>
            <Link to="/performance" className="hover:text-white" activeProps={{ className: 'text-white' }}>
              Leistung
            </Link>
            <RelockButton />
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
