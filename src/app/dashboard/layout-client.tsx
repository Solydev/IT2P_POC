'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import ComingSoon from '@/components/ComingSoon'

interface DashboardLayoutProps {
  children: React.ReactNode
  practitionerName?: string
}

export default function DashboardLayoutClient({ 
  children, 
  practitionerName = 'Praticien' 
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-it2p-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-it2p-surface border-r border-it2p-sand/30 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-it2p-sand/30">
          <h1 className="text-2xl font-serif font-bold text-it2p-accent">
            IT2P
          </h1>
          <p className="text-xs text-it2p-text-secondary mt-1">
            Inventaire du Travail en 2 Pôles
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className={`block px-4 py-2.5 rounded transition-colors ${
              isActive('/dashboard')
                ? 'bg-it2p-accent text-white'
                : 'text-it2p-text hover:bg-it2p-sand-light'
            }`}
          >
            Mes sessions
          </Link>

          <ComingSoon inline>
            <button
              disabled
              className="w-full text-left px-4 py-2.5 rounded text-it2p-text-secondary cursor-not-allowed"
            >
              Mon abonnement
            </button>
          </ComingSoon>

          <ComingSoon inline>
            <button
              disabled
              className="w-full text-left px-4 py-2.5 rounded text-it2p-text-secondary cursor-not-allowed"
            >
              Personnalisation
            </button>
          </ComingSoon>

          <ComingSoon inline>
            <button
              disabled
              className="w-full text-left px-4 py-2.5 rounded text-it2p-text-secondary cursor-not-allowed"
            >
              Bilans collectifs
            </button>
          </ComingSoon>

          <ComingSoon inline>
            <button
              disabled
              className="w-full text-left px-4 py-2.5 rounded text-it2p-text-secondary cursor-not-allowed"
            >
              Administration IA2P
            </button>
          </ComingSoon>
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-it2p-sand/30">
          <div className="mb-3">
            <p className="text-sm font-medium text-it2p-text">{practitionerName}</p>
            <p className="text-xs text-it2p-text-secondary">Praticien</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-it2p-error hover:bg-it2p-error/10 rounded transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
