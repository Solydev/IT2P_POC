'use client'

import { useState, useEffect } from 'react'

interface PersonEditModalProps {
  isOpen: boolean
  onClose: () => void
  onPersonUpdated: () => void
  person: {
    id: string
    firstName: string
    lastName: string
    email: string | null
  }
}

export default function PersonEditModal({
  isOpen,
  onClose,
  onPersonUpdated,
  person,
}: PersonEditModalProps) {
  const [firstName, setFirstName] = useState(person.firstName)
  const [lastName, setLastName] = useState(person.lastName)
  const [email, setEmail] = useState(person.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reset form when person changes
  useEffect(() => {
    setFirstName(person.firstName)
    setLastName(person.lastName)
    setEmail(person.email || '')
    setError('')
  }, [person])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim()) {
      setError('Le prénom et le nom sont requis')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/persons/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      onPersonUpdated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-it2p-surface rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-serif font-bold text-it2p-text mb-6">
          Modifier le coaché
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-it2p-error/10 border border-it2p-error/20 text-it2p-error px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-it2p-text mb-1">
              Prénom <span className="text-it2p-error">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-it2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-it2p-accent"
              placeholder="Prénom"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-it2p-text mb-1">
              Nom <span className="text-it2p-error">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-it2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-it2p-accent"
              placeholder="Nom"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-it2p-text mb-1">
              Email (optionnel)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-it2p-sand/50 rounded focus:outline-none focus:ring-2 focus:ring-it2p-accent"
              placeholder="email@example.com"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-it2p-text-secondary hover:text-it2p-text transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium bg-it2p-accent text-white rounded hover:bg-it2p-accent-hover transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
