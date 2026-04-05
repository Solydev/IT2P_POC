'use client'

import { useState, useEffect } from 'react'

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface SessionEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSessionUpdated: () => void
  session: {
    id: string
    personId: string
    context: string
  }
}

export default function SessionEditModal({
  isOpen,
  onClose,
  onSessionUpdated,
  session,
}: SessionEditModalProps) {
  const [personId, setPersonId] = useState(session.personId)
  const [context, setContext] = useState(session.context)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [persons, setPersons] = useState<Person[]>([])
  const [loadingPersons, setLoadingPersons] = useState(false)

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
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, context }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      onSessionUpdated()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPersonId(session.personId)
    setContext(session.context)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-a2p-surface rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-serif font-bold text-a2p-text mb-4">
            Modifier la session
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="personId" className="block text-sm font-medium text-a2p-text mb-1">
                Coaché <span className="text-a2p-error">*</span>
              </label>
              {loadingPersons ? (
                <div className="w-full px-3 py-2 border border-a2p-sand/50 rounded bg-gray-50 text-a2p-text-secondary">
                  Chargement...
                </div>
              ) : persons.length === 0 ? (
                <div className="w-full px-3 py-2 border border-a2p-sand/50 rounded bg-gray-50 text-a2p-text-secondary">
                  Aucune personne disponible
                </div>
              ) : (
                <select
                  id="personId"
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full px-3 py-2 border border-a2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-a2p-accent"
                  required
                >
                  <option value="">Sélectionnez un coaché</option>
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
              <label htmlFor="context" className="block text-sm font-medium text-a2p-text mb-1">
                Description <span className="text-a2p-error">*</span>
              </label>
              <input
                id="context"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 border border-a2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-a2p-accent"
                placeholder="Ex: Recrutement, Accompagnement managérial"
                required
              />
            </div>

            {error && (
              <div className="bg-a2p-error/10 border border-a2p-error/20 text-a2p-error px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-a2p-text-secondary hover:text-a2p-text transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-a2p-accent text-white rounded hover:bg-a2p-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || loadingPersons || persons.length === 0}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
