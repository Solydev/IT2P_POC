'use client'

import { useState, useEffect } from 'react'
import { useToast } from './ToastProvider'

const MODAL_CLOSE_DELAY_MS = 500

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface SessionCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSessionCreated: () => void
}

export default function SessionCreateModal({
  isOpen,
  onClose,
  onSessionCreated,
}: SessionCreateModalProps) {
  const [personId, setPersonId] = useState('')
  const [coacheeName, setCoacheeName] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [persons, setPersons] = useState<Person[]>([])
  const [loadingPersons, setLoadingPersons] = useState(false)
  const { showToast } = useToast()

  // Fetch persons when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPersons()
    }
  }, [isOpen])

  const fetchPersons = async () => {
    setLoadingPersons(true)
    try {
      const response = await fetch('/api/persons')
      const data = await response.json()
      
      if (response.ok) {
        setPersons(data.persons || [])
      } else {
        console.error('Failed to fetch persons:', data.error)
      }
    } catch (err) {
      console.error('Error fetching persons:', err)
    } finally {
      setLoadingPersons(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!personId) {
      setError('Veuillez sélectionner une personne')
      return
    }

    if (!context.trim()) {
      setError('La description est obligatoire')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, coacheeName, context }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      // Copy the link to clipboard
      try {
        await navigator.clipboard.writeText(data.testLink)
        showToast('Session créée ! Lien copié dans le presse-papiers', 'success')
      } catch (clipboardError) {
        console.error('Failed to copy link:', clipboardError)
        showToast('Session créée ! Impossible de copier le lien automatiquement', 'info')
      }

      // Notify parent component
      onSessionCreated()
      
      // Close the modal after a short delay to allow the user to see the success message
      setTimeout(() => {
        handleClose()
      }, MODAL_CLOSE_DELAY_MS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPersonId('')
    setCoacheeName('')
    setContext('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-it2p-surface rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-serif font-bold text-it2p-text mb-4">
            Nouvelle session
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="personId" className="block text-sm font-medium text-it2p-text mb-1">
                Personne <span className="text-it2p-error">*</span>
              </label>
              {loadingPersons ? (
                <div className="w-full px-3 py-2 border border-it2p-sand/50 rounded bg-gray-50 text-it2p-text-secondary">
                  Chargement...
                </div>
              ) : persons.length === 0 ? (
                <div className="w-full px-3 py-2 border border-it2p-sand/50 rounded bg-gray-50 text-it2p-text-secondary">
                  Aucune personne disponible. Créez-en une d&apos;abord.
                </div>
              ) : (
                <select
                  id="personId"
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full px-3 py-2 border border-it2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-it2p-accent"
                  required
                >
                  <option value="">Sélectionnez une personne</option>
                  {persons.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                      {person.email && ` (${person.email})`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="context" className="block text-sm font-medium text-it2p-text mb-1">
                Description <span className="text-it2p-error">*</span>
              </label>
              <input
                id="context"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 border border-it2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-it2p-accent"
                placeholder="Ex: Recrutement, Accompagnement managérial"
                required
              />
            </div>

            <div>
              <label htmlFor="coacheeName" className="block text-sm font-medium text-it2p-text mb-1">
                Nom du coaché
                <span className="text-it2p-text-secondary font-normal ml-1">(optionnel)</span>
              </label>
              <input
                id="coacheeName"
                type="text"
                value={coacheeName}
                onChange={(e) => setCoacheeName(e.target.value)}
                className="w-full px-3 py-2 border border-it2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-it2p-accent"
                placeholder="Ex: Marie Dupont"
              />
            </div>

            {error && (
              <div className="bg-it2p-error/10 border border-it2p-error/20 text-it2p-error px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-it2p-text-secondary hover:text-it2p-text transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-it2p-accent text-white rounded hover:bg-it2p-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || loadingPersons || persons.length === 0}
              >
                {loading ? 'Création...' : 'Créer la session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
