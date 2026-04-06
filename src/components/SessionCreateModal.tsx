'use client'

import { useState, useEffect } from 'react'
import { useToast } from './ToastProvider'

const MODAL_CLOSE_DELAY_MS = 3000

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
  const [createdSessionLink, setCreatedSessionLink] = useState<string | null>(null)
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

      // Store the link to display in success state
      setCreatedSessionLink(data.testLink)

      // Copy the link to clipboard
      try {
        await navigator.clipboard.writeText(data.testLink)
        showToast('Session créée ! Lien copié dans le presse-papiers', 'success')
      } catch (clipboardError) {
        console.error('Failed to copy link:', clipboardError)
        showToast('Session créée !', 'success')
      }

      // Notify parent component
      onSessionCreated()
      
      // Close the modal after a delay to show the link
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
    setCreatedSessionLink(null)
    onClose()
  }

  if (!isOpen) return null

  // Success state: Show created link with sharing options
  if (createdSessionLink) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-a2p-surface rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-a2p-success rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-serif font-bold text-a2p-text mb-2 text-center">
              Session créée avec succès !
            </h2>
            
            <p className="text-sm text-a2p-text-secondary mb-4 text-center">
              Votre lien de test a été généré et copié dans le presse-papiers.
            </p>

            <div className="bg-gray-50 border border-a2p-sand/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-a2p-text-secondary mb-2 font-medium">Lien du test :</p>
              <p className="text-sm text-a2p-text break-all font-mono">{createdSessionLink}</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(createdSessionLink)
                    showToast('Lien copié !', 'success')
                  } catch (error) {
                    console.error('Failed to copy:', error)
                  }
                }}
                className="w-full px-4 py-2.5 text-sm font-medium bg-a2p-accent text-white rounded hover:bg-a2p-accent-hover transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Copier à nouveau
              </button>

              <a
                href={createdSessionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-a2p-accent text-a2p-accent rounded hover:bg-a2p-accent/5 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Ouvrir le test
              </a>

              <a
                href={`mailto:?subject=Invitation%20%C3%A0%20passer%20le%20test%20A2P&body=Bonjour%2C%0A%0AJe%20vous%20invite%20%C3%A0%20passer%20le%20test%20A2P%20%28Analyse%20de%20la%20Personnalit%C3%A9%20Professionnelle%29.%0A%0AVoici%20votre%20lien%20personnalis%C3%A9%20%3A%0A${encodeURIComponent(createdSessionLink)}%0A%0ALe%20test%20prend%20environ%2010%20minutes.%0A%0ABien%20cordialement`}
                className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-a2p-accent text-a2p-accent rounded hover:bg-a2p-accent/5 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Envoyer par email
              </a>
            </div>

            <p className="text-xs text-a2p-text-secondary text-center mt-4">
              Cette fenêtre se fermera automatiquement...
            </p>
          </div>
        </div>
      </div>
    )
  }

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
