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
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [persons, setPersons] = useState<Person[]>([])
  const [loadingPersons, setLoadingPersons] = useState(false)
  const [showNewPersonForm, setShowNewPersonForm] = useState(false)
  const [newPersonFirstName, setNewPersonFirstName] = useState('')
  const [newPersonLastName, setNewPersonLastName] = useState('')
  const [newPersonEmail, setNewPersonEmail] = useState('')
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

  const handleCreatePerson = async () => {
    setError('')
    
    // Validate new person fields
    if (!newPersonFirstName.trim() || !newPersonLastName.trim()) {
      setError('Le prénom et le nom sont requis')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newPersonFirstName,
          lastName: newPersonLastName,
          email: newPersonEmail || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la personne')
      }

      // Add the new person to the list and select them
      setPersons([...persons, data.person])
      setPersonId(data.person.id)
      
      // Reset new person form
      setNewPersonFirstName('')
      setNewPersonLastName('')
      setNewPersonEmail('')
      setShowNewPersonForm(false)
      
      showToast('Personne créée avec succès', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la personne')
    } finally {
      setLoading(false)
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
        body: JSON.stringify({ personId, context }),
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
    setContext('')
    setError('')
    setShowNewPersonForm(false)
    setNewPersonFirstName('')
    setNewPersonLastName('')
    setNewPersonEmail('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-a2p-surface rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-serif font-bold text-a2p-text mb-4">
            Nouvelle session
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
              ) : showNewPersonForm ? (
                <div className="space-y-3 p-4 border border-a2p-sand/50 rounded bg-gray-50">
                  <div>
                    <label htmlFor="newPersonFirstName" className="block text-sm font-medium text-a2p-text mb-1">
                      Prénom <span className="text-a2p-error">*</span>
                    </label>
                    <input
                      id="newPersonFirstName"
                      type="text"
                      value={newPersonFirstName}
                      onChange={(e) => setNewPersonFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-a2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-a2p-accent"
                      placeholder="Ex: Marie"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="newPersonLastName" className="block text-sm font-medium text-a2p-text mb-1">
                      Nom <span className="text-a2p-error">*</span>
                    </label>
                    <input
                      id="newPersonLastName"
                      type="text"
                      value={newPersonLastName}
                      onChange={(e) => setNewPersonLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-a2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-a2p-accent"
                      placeholder="Ex: Dupont"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="newPersonEmail" className="block text-sm font-medium text-a2p-text mb-1">
                      Email <span className="text-a2p-text-secondary font-normal">(optionnel)</span>
                    </label>
                    <input
                      id="newPersonEmail"
                      type="email"
                      value={newPersonEmail}
                      onChange={(e) => setNewPersonEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-a2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-a2p-accent"
                      placeholder="marie.dupont@example.com"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreatePerson}
                      className="px-3 py-1.5 text-sm font-medium bg-a2p-accent text-white rounded hover:bg-a2p-accent-hover transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Création...' : 'Créer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewPersonForm(false)
                        setNewPersonFirstName('')
                        setNewPersonLastName('')
                        setNewPersonEmail('')
                        setError('')
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-a2p-text-secondary hover:text-a2p-text transition-colors"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
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
                  <button
                    type="button"
                    onClick={() => setShowNewPersonForm(true)}
                    className="text-sm text-a2p-accent hover:text-a2p-accent-hover transition-colors font-medium"
                  >
                    + Créer un nouveau coaché
                  </button>
                </div>
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
                disabled={loading || loadingPersons || showNewPersonForm}
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
