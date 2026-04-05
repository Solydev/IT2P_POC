'use client'

import { useState, useEffect, useCallback } from 'react'
import PersonCard from '@/components/PersonCard'
import PersonCreateModal from '@/components/PersonCreateModal'
import PersonEditModal from '@/components/PersonEditModal'

interface Person {
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

export default function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedPersonIds, setSelectedPersonIds] = useState<Set<string>>(new Set())
  const [isBulkDeactivating, setIsBulkDeactivating] = useState(false)

  const fetchPersons = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/persons?filter=${filter}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération')
      }

      setPersons(data.persons || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchPersons()
    // Exit selection mode when filter changes
    setSelectionMode(false)
    setSelectedPersonIds(new Set())
  }, [filter, fetchPersons])

  const handlePersonCreated = () => {
    fetchPersons()
  }

  const handlePersonUpdated = () => {
    fetchPersons()
    setEditingPerson(null)
  }

  const handlePersonDeleted = () => {
    fetchPersons()
  }

  const handleSelectionChange = (personId: string, selected: boolean) => {
    const newSelection = new Set(selectedPersonIds)
    if (selected) {
      newSelection.add(personId)
    } else {
      newSelection.delete(personId)
    }
    setSelectedPersonIds(newSelection)
  }

  const handleSelectAll = () => {
    const activePersons = persons.filter((p) => p.isActive)
    if (selectedPersonIds.size === activePersons.length) {
      // Deselect all
      setSelectedPersonIds(new Set())
    } else {
      // Select all active persons
      setSelectedPersonIds(new Set(activePersons.map((p) => p.id)))
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedPersonIds.size === 0) {
      alert('Veuillez sélectionner au moins une personne')
      return
    }

    const confirmMessage = `Êtes-vous sûr de vouloir désactiver ${selectedPersonIds.size} personne(s) ?`
    if (!confirm(confirmMessage)) {
      return
    }

    setIsBulkDeactivating(true)
    try {
      const response = await fetch('/api/persons/bulk-deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personIds: Array.from(selectedPersonIds),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la désactivation')
      }

      alert(data.message || 'Personnes désactivées avec succès')
      setSelectedPersonIds(new Set())
      setSelectionMode(false)
      fetchPersons()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la désactivation')
    } finally {
      setIsBulkDeactivating(false)
    }
  }

  const activePersonsCount = persons.filter((p) => p.isActive).length
  const inactivePersonsCount = persons.filter((p) => !p.isActive).length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-it2p-text">
              Gestion des coachés
            </h1>
            <p className="text-sm text-it2p-text-secondary mt-1">
              Gérez vos coachés et leurs informations
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 sm:px-6 py-2.5 bg-it2p-accent text-white rounded-lg hover:bg-it2p-accent-hover transition-colors text-sm sm:text-base font-medium"
          >
            + Nouveau coaché
          </button>
        </div>

        {/* Filter and Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                filter === 'active'
                  ? 'bg-it2p-accent text-white'
                  : 'bg-it2p-surface border border-it2p-sand/30 text-it2p-text hover:bg-it2p-sand-light'
              }`}
            >
              Actifs ({activePersonsCount})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                filter === 'inactive'
                  ? 'bg-it2p-accent text-white'
                  : 'bg-it2p-surface border border-it2p-sand/30 text-it2p-text hover:bg-it2p-sand-light'
              }`}
            >
              Désactivés ({inactivePersonsCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                filter === 'all'
                  ? 'bg-it2p-accent text-white'
                  : 'bg-it2p-surface border border-it2p-sand/30 text-it2p-text hover:bg-it2p-sand-light'
              }`}
            >
              Tous ({persons.length})
            </button>
          </div>

          <div className="flex gap-2">
            {!selectionMode ? (
              <button
                onClick={() => setSelectionMode(true)}
                disabled={activePersonsCount === 0}
                className="px-4 py-2 text-sm font-medium bg-it2p-surface border border-it2p-sand/30 text-it2p-text rounded hover:bg-it2p-sand-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sélection multiple
              </button>
            ) : (
              <>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-sm font-medium bg-it2p-surface border border-it2p-sand/30 text-it2p-text rounded hover:bg-it2p-sand-light transition-colors"
                >
                  {selectedPersonIds.size === activePersonsCount ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
                <button
                  onClick={handleBulkDeactivate}
                  disabled={selectedPersonIds.size === 0 || isBulkDeactivating}
                  className="px-4 py-2 text-sm font-medium bg-it2p-warning text-white rounded hover:bg-it2p-warning/80 transition-colors disabled:opacity-50"
                >
                  {isBulkDeactivating
                    ? 'Désactivation...'
                    : `Désactiver (${selectedPersonIds.size})`}
                </button>
                <button
                  onClick={() => {
                    setSelectionMode(false)
                    setSelectedPersonIds(new Set())
                  }}
                  className="px-4 py-2 text-sm font-medium text-it2p-text-secondary hover:text-it2p-text transition-colors"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-it2p-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-it2p-text-secondary">Chargement des coachés...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-it2p-error/10 border border-it2p-error/20 text-it2p-error px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && persons.length === 0 && (
          <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-it2p-text-secondary mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-it2p-text mb-2">
              {filter === 'active' && 'Aucun coaché actif'}
              {filter === 'inactive' && 'Aucun coaché désactivé'}
              {filter === 'all' && 'Aucun coaché'}
            </h3>
            <p className="text-it2p-text-secondary mb-4">
              {filter === 'all'
                ? 'Commencez par créer votre premier coaché'
                : 'Essayez de changer le filtre pour voir d\'autres coachés'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2.5 bg-it2p-accent text-white rounded-lg hover:bg-it2p-accent-hover transition-colors font-medium"
              >
                + Créer un coaché
              </button>
            )}
          </div>
        )}

        {/* Persons Grid */}
        {!loading && !error && persons.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {persons.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onPersonUpdated={handlePersonUpdated}
                onPersonDeleted={handlePersonDeleted}
                onEditClick={() => setEditingPerson(person)}
                selectionMode={selectionMode && person.isActive}
                isSelected={selectedPersonIds.has(person.id)}
                onSelectionChange={(selected) => handleSelectionChange(person.id, selected)}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <PersonCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPersonCreated={handlePersonCreated}
        />

        {editingPerson && (
          <PersonEditModal
            isOpen={true}
            onClose={() => setEditingPerson(null)}
            onPersonUpdated={handlePersonUpdated}
            person={editingPerson}
          />
        )}
      </div>
    </div>
  )
}
