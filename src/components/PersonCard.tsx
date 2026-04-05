'use client'

import { useState } from 'react'

interface PersonCardProps {
  person: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    isActive: boolean
    createdAt: string
    _count?: {
      sessions: number
    }
  }
  onPersonUpdated?: () => void
  onPersonDeleted?: () => void
  onEditClick?: () => void
  selectionMode?: boolean
  isSelected?: boolean
  onSelectionChange?: (selected: boolean) => void
}

export default function PersonCard({
  person,
  onPersonUpdated,
  onPersonDeleted,
  onEditClick,
  selectionMode = false,
  isSelected = false,
  onSelectionChange,
}: PersonCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/persons/${person.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      onPersonDeleted?.()
    } catch (error) {
      console.error('Error deleting person:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleToggleActive = async () => {
    setIsToggling(true)
    try {
      const response = await fetch(`/api/persons/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          isActive: !person.isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      onPersonUpdated?.()
    } catch (error) {
      console.error('Error toggling person status:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <>
      <div
        className={`bg-a2p-surface border ${
          person.isActive ? 'border-a2p-sand/30' : 'border-a2p-sand/50 bg-a2p-sand/5'
        } rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow ${
          selectionMode && isSelected ? 'ring-2 ring-a2p-accent' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {selectionMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelectionChange?.(e.target.checked)}
                className="mt-1 w-4 h-4 text-a2p-accent border-a2p-sand rounded focus:ring-a2p-accent"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-a2p-text mb-1">
                {person.firstName} {person.lastName}
                {!person.isActive && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-a2p-coming-soon/20 text-a2p-text-secondary border border-a2p-coming-soon/30">
                    Désactivé
                  </span>
                )}
              </h3>
              {person.email && (
                <p className="text-sm text-a2p-text-secondary mb-1">
                  {person.email}
                </p>
              )}
              <p className="text-sm text-a2p-text-secondary">
                Créé le {formatDate(person.createdAt)}
              </p>
              <p className="text-sm text-a2p-text-secondary">
                {person._count?.sessions || 0} session(s)
              </p>
            </div>
          </div>
          {!selectionMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={onEditClick}
                className="p-1.5 text-a2p-text-secondary hover:text-a2p-text transition-colors"
                title="Modifier"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-a2p-text-secondary hover:text-a2p-error transition-colors"
                title="Supprimer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {!selectionMode && (
          <div className="flex gap-2 flex-wrap mt-4">
            <button
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                person.isActive
                  ? 'bg-a2p-warning/10 text-a2p-warning hover:bg-a2p-warning/20 border border-a2p-warning/30'
                  : 'bg-a2p-success/10 text-a2p-success hover:bg-a2p-success/20 border border-a2p-success/30'
              }`}
            >
              {isToggling ? 'Traitement...' : person.isActive ? 'Désactiver' : 'Réactiver'}
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-a2p-surface rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif font-bold text-a2p-text mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-a2p-text-secondary mb-6">
              Êtes-vous sûr de vouloir supprimer{' '}
              <strong>
                {person.firstName} {person.lastName}
              </strong>
              ?
              {person._count && person._count.sessions > 0 && (
                <span className="block mt-2 text-a2p-error text-sm">
                  Cette personne a {person._count.sessions} session(s) associée(s). La suppression
                  échouera.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-a2p-text-secondary hover:text-a2p-text transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium bg-a2p-error text-white rounded hover:bg-a2p-error/80 transition-colors disabled:opacity-50"
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
