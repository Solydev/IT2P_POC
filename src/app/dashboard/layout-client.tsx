'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import ComingSoon from '@/components/ComingSoon'
import { ToastProvider } from '@/components/ToastProvider'

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
    <ToastProvider>
      <div className="min-h-screen bg-a2p-bg flex">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-a2p-surface border-r border-a2p-sand/30 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-a2p-sand/30">
            <h1 className="text-2xl font-serif font-bold text-a2p-accent">
              A2P
            </h1>
            <p className="text-xs text-a2p-text-secondary mt-1">
              Analyse de la Personnalité Professionnelle
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard"
              className={`block px-4 py-2.5 rounded transition-colors ${
                isActive('/dashboard')
                  ? 'bg-a2p-accent text-white'
                  : 'text-a2p-text hover:bg-a2p-sand-light'
              }`}
            >
              Mes sessions
            </Link>

            <Link
              href="/dashboard/persons"
              className={`block px-4 py-2.5 rounded transition-colors ${
                pathname?.startsWith('/dashboard/persons')
                  ? 'bg-a2p-accent text-white'
                  : 'text-a2p-text hover:bg-a2p-sand-light'
              }`}
            >
              Gestion des coachés
            </Link>

            <Link
              href="/dashboard/subscription"
              className={`flex items-center justify-between px-4 py-2.5 rounded transition-colors ${
                pathname?.startsWith('/dashboard/subscription')
                  ? 'bg-a2p-accent text-white'
                  : 'text-a2p-text hover:bg-a2p-sand-light'
              }`}
            >
              <span>Mon abonnement</span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-a2p-warning/15 text-a2p-warning">
                Demo
              </span>
            </Link>

            <Link
              href="/dashboard/customization"
              className={`flex items-center justify-between px-4 py-2.5 rounded transition-colors ${
                pathname?.startsWith('/dashboard/customization')
                  ? 'bg-a2p-accent text-white'
                  : 'text-a2p-text hover:bg-a2p-sand-light'
              }`}
            >
              <span>Personnalisation</span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-a2p-warning/15 text-a2p-warning">
                Demo
              </span>
            </Link>

            <Link
              href="/dashboard/reports"
              className={`flex items-center justify-between px-4 py-2.5 rounded transition-colors ${
                pathname?.startsWith('/dashboard/reports')
                  ? 'bg-a2p-accent text-white'
                  : 'text-a2p-text hover:bg-a2p-sand-light'
              }`}
            >
              <span>Bilans collectifs</span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-a2p-warning/15 text-a2p-warning">
                Demo
              </span>
            </Link>

            <Link
              href="/dashboard/admin"
              className={`flex items-center justify-between px-4 py-2.5 rounded transition-colors ${
                pathname?.startsWith('/dashboard/admin')
                  ? 'bg-a2p-accent text-white'
                  : 'text-a2p-text hover:bg-a2p-sand-light'
              }`}
            >
              <span>Administration IA2P</span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-a2p-warning/15 text-a2p-warning">
                Demo
              </span>
            </Link>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-a2p-sand/30">
            <div className="mb-3">
              <p className="text-sm font-medium text-a2p-text">{practitionerName}</p>
              <p className="text-xs text-a2p-text-secondary">Praticien</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-a2p-error hover:bg-a2p-error/10 rounded transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Mobile header with hamburger */}
          <div className="lg:hidden sticky top-0 z-30 bg-a2p-surface border-b border-a2p-sand/30 px-4 py-3 flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-a2p-sand-light transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-a2p-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/dashboard" className="text-xl font-serif font-bold text-a2p-accent absolute left-1/2 -translate-x-1/2">A2P</Link>
          </div>
          
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
