'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusBadge from './StatusBadge'
import CopyLinkButton from './CopyLinkButton'
import SessionEditModal from './SessionEditModal'
import { getAppUrl } from '@/lib/config'

interface SessionCardProps {
  session: {
    id: string
    token: string
    personId: string
    person?: {
      firstName: string
      lastName: string
      email: string | null
    }
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
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
  onSessionUpdated?: () => void
  onSessionDeleted?: () => void
}

export default function SessionCard({ session, onSessionUpdated, onSessionDeleted }: SessionCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const appUrl = getAppUrl()
  const testLink = `${appUrl}/test/${session.token}`
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      onSessionDeleted?.()
    } catch (error) {
      console.error('Error deleting session:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const displayName = session.person 
    ? `${session.person.firstName} ${session.person.lastName}`
    : <span className="italic text-a2p-text-secondary">Non renseigné</span>
  const displayContext = session.context || <span className="italic text-a2p-text-secondary">Aucune description</span>

  return (
    <>
      <div className="bg-a2p-surface border border-a2p-sand/30 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-a2p-text mb-1">
              {displayName}
            </h3>
            <p className="text-sm text-a2p-text-secondary">
              {displayContext}
            </p>
            <p className="text-sm text-a2p-text-secondary">
              Créé le {formatDate(session.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={session.status} />
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1.5 text-a2p-text-secondary hover:text-a2p-text transition-colors"
              title="Modifier"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-a2p-error hover:text-a2p-error/80 transition-colors"
              title="Supprimer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {session.expiresAt && session.status !== 'EXPIRED' && session.status !== 'COMPLETED' && (
            <p className="text-sm text-a2p-text-secondary">
              <span className="font-medium">Expire le:</span> {formatDate(session.expiresAt)}
            </p>
          )}
          {session.completedAt && (
            <p className="text-sm text-a2p-text-secondary">
              <span className="font-medium">Complété le:</span> {formatDate(session.completedAt)}
            </p>
          )}
          {session._count && session._count.answers > 0 && session.status === 'IN_PROGRESS' && (
            <p className="text-sm text-a2p-text-secondary">
              <span className="font-medium">Réponses:</span> {session._count.answers}/14
            </p>
          )}
          {session.result && (
            <p className="text-sm text-a2p-text-secondary">
              <span className="font-medium">Profil:</span> {session.result.profileCode}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {(session.status === 'PENDING' || session.status === 'IN_PROGRESS') && (
            <>
              <CopyLinkButton link={testLink} />
              <a
                href={testLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm font-medium bg-white border border-a2p-accent text-a2p-accent rounded hover:bg-a2p-accent/5 transition-colors flex items-center gap-1.5"
                title="Ouvrir le test dans un nouvel onglet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Ouvrir
              </a>
              <a
                href={`mailto:?subject=Invitation%20%C3%A0%20passer%20le%20test%20A2P&body=Bonjour%2C%0A%0AJe%20vous%20invite%20%C3%A0%20passer%20le%20test%20A2P%20%28Analyse%20de%20la%20Personnalit%C3%A9%20Professionnelle%29.%0A%0AVoici%20votre%20lien%20personnalis%C3%A9%20%3A%0A${encodeURIComponent(testLink)}%0A%0ALe%20test%20prend%20environ%2010%20minutes.%0A%0ABien%20cordialement`}
                className="px-3 py-1.5 text-sm font-medium bg-white border border-a2p-accent text-a2p-accent rounded hover:bg-a2p-accent/5 transition-colors flex items-center gap-1.5"
                title="Envoyer par email"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Envoyer
              </a>
            </>
          )}
          {session.status === 'COMPLETED' && session.result && (
            <Link
              href={`/dashboard/session/${session.id}`}
              className="px-3 py-1.5 text-sm font-medium bg-a2p-accent text-white rounded hover:bg-a2p-accent-hover transition-colors"
            >
              Voir le bilan
            </Link>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <SessionEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSessionUpdated={() => {
          onSessionUpdated?.()
          setIsEditModalOpen(false)
        }}
        session={session}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-a2p-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-serif font-bold text-a2p-text mb-3">
              Confirmer la suppression
            </h3>
            <p className="text-a2p-text-secondary mb-4">
              Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-a2p-text-secondary hover:text-a2p-text transition-colors"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium bg-a2p-error text-white rounded hover:bg-a2p-error/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
