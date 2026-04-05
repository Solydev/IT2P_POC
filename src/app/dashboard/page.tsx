'use client'

import { useState, useEffect } from 'react'
import SessionCard from '@/components/SessionCard'
import SessionCreateModal from '@/components/SessionCreateModal'

interface Session {
  id: string
  token: string
  personId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
  coacheeName: string | null
  context: string
  createdAt: string
  expiresAt?: string | null
  completedAt?: string | null
  _count?: {
    answers: number
  }
  result?: {
    profileCode: string
  } | null
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sessions')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des sessions')
      }
      
      const data = await response.json()
      setSessions(data.sessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleSessionCreated = () => {
    fetchSessions()
  }

  const handleSessionUpdated = () => {
    fetchSessions()
  }

  const handleSessionDeleted = () => {
    fetchSessions()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-it2p-text-secondary">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-it2p-error/10 border border-it2p-error/20 text-it2p-error px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-it2p-text mb-2">
              Mes sessions
            </h1>
            <p className="text-sm sm:text-base text-it2p-text-secondary">
              Gérez vos sessions et suivez les résultats de vos coachés
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-it2p-accent text-white font-medium rounded-lg hover:bg-it2p-accent-hover transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
          >
            + Nouvelle session
          </button>
        </div>

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-6 sm:p-8 lg:p-12 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-it2p-text mb-3">
                Aucune session pour le moment
              </h2>
              <p className="text-sm sm:text-base text-it2p-text-secondary mb-6">
                Créez votre première session pour commencer à utiliser l&apos;IT2P avec vos coachés.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-it2p-accent text-white font-medium rounded-lg hover:bg-it2p-accent-hover transition-colors"
              >
                Créer ma première session
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onSessionUpdated={handleSessionUpdated}
                onSessionDeleted={handleSessionDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <SessionCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  )
}
