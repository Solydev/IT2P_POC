'use client'

import { useState } from 'react'
import CopyLinkButton from './CopyLinkButton'

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
  const [patientName, setPatientName] = useState('')
  const [patientContext, setPatientContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdLink, setCreatedLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName, patientContext }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      setCreatedLink(data.testLink)
      onSessionCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPatientName('')
    setPatientContext('')
    setError('')
    setCreatedLink('')
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

          {!createdLink ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-it2p-text mb-1">
                  Nom du coaché *
                </label>
                <input
                  id="patientName"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-it2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-it2p-accent"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div>
                <label htmlFor="patientContext" className="block text-sm font-medium text-it2p-text mb-1">
                  Contexte (optionnel)
                </label>
                <textarea
                  id="patientContext"
                  value={patientContext}
                  onChange={(e) => setPatientContext(e.target.value)}
                  className="w-full px-3 py-2 border border-it2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-it2p-accent resize-none"
                  placeholder="Notes sur le contexte de la session..."
                  rows={3}
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
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer la session'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-it2p-success/10 border border-it2p-success/20 text-it2p-success px-4 py-3 rounded">
                <p className="font-medium mb-1">Session créée avec succès !</p>
                <p className="text-sm">Partagez ce lien avec votre coaché :</p>
              </div>

              <div className="bg-it2p-sand-light p-3 rounded break-all text-sm font-mono">
                {createdLink}
              </div>

              <div className="flex items-center justify-center">
                <CopyLinkButton link={createdLink} />
              </div>

              <div className="text-center">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium bg-it2p-accent text-white rounded hover:bg-it2p-accent-hover transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
