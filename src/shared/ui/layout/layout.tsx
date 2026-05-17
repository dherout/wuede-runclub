import { Link } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { RelockButton } from '@features/relock-button'

const NAV: { to: '/' | '/leaderboard' | '/performance'; label: string; exact?: boolean }[] = [
  { to: '/', label: 'Übersicht', exact: true },
  { to: '/leaderboard', label: 'Bestenliste' },
  { to: '/performance', label: 'Leistung' },
]

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-800 bg-neutral-900/80 px-4 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          aria-label="Menü öffnen"
          onClick={() => setOpen(true)}
          className="rounded p-1 text-neutral-200 hover:bg-neutral-800"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <Link to="/" className="text-base font-semibold tracking-tight">
          Wüde Runclub
        </Link>
      </header>

      {open && (
        <div
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-800 bg-neutral-900 transition-transform duration-200 md:translate-x-0 md:transition-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <Link to="/" onClick={close} className="text-base font-semibold tracking-tight">
            Wüde Runclub
          </Link>
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={close}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4 text-sm text-neutral-300">
          {NAV.map(({ to, label, exact }) => (
            <Link
              key={to}
              to={to}
              onClick={close}
              activeOptions={exact ? { exact: true } : undefined}
              className="rounded px-3 py-2 hover:bg-neutral-800 hover:text-white"
              activeProps={{ className: 'bg-neutral-800 text-white' }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-neutral-800 p-3">
          <RelockButton />
        </div>
      </aside>

      <main className="px-4 py-6 md:py-8 md:pl-72 md:pr-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
