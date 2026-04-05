'use client'

import { useState } from 'react'

const platformStats = [
  { label: 'Praticiens actifs', value: '47', trend: '+3 ce mois', up: true },
  { label: 'Sessions totales', value: '1 284', trend: '+128 ce mois', up: true },
  { label: 'Tests complétés', value: '924', trend: '72 % de complétion', up: null },
  { label: 'Profils générés', value: '924', trend: '18 profils distincts', up: null },
]

const practitioners = [
  { id: 1, name: 'Marie Dupont', email: 'marie@cabinet-dupont.fr', plan: 'Pro', sessions: 142, status: 'Actif', since: 'jan. 2025' },
  { id: 2, name: 'Thomas Reneaux', email: 'thomas.r@rh-conseil.fr', plan: 'Starter', sessions: 58, status: 'Actif', since: 'mars 2025' },
  { id: 3, name: 'Sophie Blanc', email: 'sophie@blanc-coaching.com', plan: 'Pro', sessions: 201, status: 'Actif', since: 'oct. 2024' },
  { id: 4, name: 'Laurent Petit', email: 'l.petit@grouperhone.fr', plan: 'Essai', sessions: 7, status: 'Essai', since: 'mars 2026' },
  { id: 5, name: 'Camille Morin', email: 'c.morin@rh-pro.fr', plan: 'Starter', sessions: 34, status: 'Suspendu', since: 'juin 2025' },
]

const profileDescriptions = [
  { code: 'P1-A', name: 'Ancrage Structurant', status: 'Publié', lastEdited: '12 fév. 2026' },
  { code: 'P2-A', name: 'Ancrage Équilibré', status: 'Publié', lastEdited: '12 fév. 2026' },
  { code: 'P3-A', name: 'Ancrage Dynamique', status: 'Brouillon', lastEdited: '01 mars 2026' },
  { code: 'P1-M', name: 'Mouvement Exploratoire', status: 'Publié', lastEdited: '12 fév. 2026' },
  { code: 'P2-M', name: 'Mouvement Équilibré', status: 'Publié', lastEdited: '12 fév. 2026' },
  { code: 'P3-M', name: 'Mouvement Impulsif', status: 'Brouillon', lastEdited: '02 mars 2026' },
]

const tabs = ['Praticiens', 'Contenu des profils', 'Paramètres système']

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Praticiens')

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-it2p-text">
              Administration IA2P
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 bg-it2p-error/10 text-it2p-error rounded">
              Accès restreint
            </span>
          </div>
          <p className="text-sm sm:text-base text-it2p-text-secondary">
            Gestion globale de la plateforme, des praticiens et des contenus
          </p>
        </div>

        {/* Platform stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {platformStats.map((s, i) => (
            <div key={i} className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-it2p-text-secondary mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-it2p-text font-serif">{s.value}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                s.up === true ? 'text-it2p-success' : s.up === false ? 'text-it2p-error' : 'text-it2p-text-secondary'
              }`}>
                {s.up === true && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {s.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-it2p-sand/30 mb-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-it2p-accent text-it2p-accent'
                    : 'border-transparent text-it2p-text-secondary hover:text-it2p-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Praticiens */}
        {activeTab === 'Praticiens' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-it2p-text-secondary">
                {practitioners.length} praticiens enregistrés
              </p>
              <button className="px-4 py-2 text-sm bg-it2p-accent text-white rounded-lg hover:bg-it2p-accent-hover transition-colors font-medium">
                + Inviter un praticien
              </button>
            </div>
            <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-it2p-sand/20 bg-it2p-bg">
                      <th className="text-left px-4 py-3 text-xs font-medium text-it2p-text-secondary uppercase tracking-wide">
                        Praticien
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-it2p-text-secondary uppercase tracking-wide hidden sm:table-cell">
                        Plan
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-it2p-text-secondary uppercase tracking-wide hidden md:table-cell">
                        Sessions
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-it2p-text-secondary uppercase tracking-wide hidden lg:table-cell">
                        Depuis
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-it2p-text-secondary uppercase tracking-wide">
                        Statut
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-it2p-sand/20">
                    {practitioners.map((p) => (
                      <tr key={p.id} className="hover:bg-it2p-sand-light/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-it2p-text">{p.name}</p>
                          <p className="text-xs text-it2p-text-secondary">{p.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            p.plan === 'Pro'
                              ? 'bg-it2p-accent/10 text-it2p-accent'
                              : p.plan === 'Starter'
                              ? 'bg-it2p-success/10 text-it2p-success'
                              : 'bg-it2p-sand/30 text-it2p-text-secondary'
                          }`}>
                            {p.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-it2p-text-secondary hidden md:table-cell">
                          {p.sessions}
                        </td>
                        <td className="px-4 py-3 text-it2p-text-secondary hidden lg:table-cell">
                          {p.since}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            p.status === 'Actif'
                              ? 'bg-it2p-success/10 text-it2p-success'
                              : p.status === 'Essai'
                              ? 'bg-it2p-warning/15 text-it2p-warning'
                              : 'bg-it2p-error/10 text-it2p-error'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-xs text-it2p-accent hover:underline">
                            Gérer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Contenu des profils */}
        {activeTab === 'Contenu des profils' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-it2p-text-secondary">
                {profileDescriptions.length} profils dans la base
              </p>
              <button className="px-4 py-2 text-sm bg-it2p-accent text-white rounded-lg hover:bg-it2p-accent-hover transition-colors font-medium">
                + Nouveau profil
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profileDescriptions.map((prof) => (
                <div key={prof.code} className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-lg font-mono font-bold text-it2p-accent">{prof.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      prof.status === 'Publié'
                        ? 'bg-it2p-success/10 text-it2p-success'
                        : 'bg-it2p-warning/15 text-it2p-warning'
                    }`}>
                      {prof.status}
                    </span>
                  </div>
                  <p className="font-medium text-it2p-text text-sm mb-1">{prof.name}</p>
                  <p className="text-xs text-it2p-text-secondary mb-4">Modifié le {prof.lastEdited}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 text-xs bg-it2p-accent text-white rounded hover:bg-it2p-accent-hover transition-colors font-medium">
                      Modifier
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-it2p-surface border border-it2p-sand/40 text-it2p-text rounded hover:bg-it2p-sand-light transition-colors">
                      Aperçu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Paramètres système */}
        {activeTab === 'Paramètres système' && (
          <div className="space-y-5">

            <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-semibold text-it2p-text mb-4">Durée de validité des sessions</h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  defaultValue={7}
                  min={1}
                  max={90}
                  className="w-24 px-3 py-2 text-sm border border-it2p-sand/50 rounded-lg bg-it2p-bg text-it2p-text focus:outline-none focus:ring-2 focus:ring-it2p-accent/30"
                />
                <span className="text-sm text-it2p-text-secondary">jours (par défaut)</span>
              </div>
              <p className="text-xs text-it2p-text-secondary mt-2">
                Durée par défaut avant expiration d'un lien de questionnaire
              </p>
            </div>

            <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-semibold text-it2p-text mb-4">Emails système</h3>
              <div className="space-y-3">
                {[
                  { label: 'Expéditeur', value: 'noreply@ia2p.fr' },
                  { label: 'Objet par défaut', value: 'Votre questionnaire A2P' },
                ].map((field) => (
                  <div key={field.label} className="flex items-center gap-4">
                    <label className="w-40 text-sm text-it2p-text-secondary flex-shrink-0">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="flex-1 px-3 py-2 text-sm border border-it2p-sand/50 rounded-lg bg-it2p-bg text-it2p-text focus:outline-none focus:ring-2 focus:ring-it2p-accent/30"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-semibold text-it2p-text mb-4">Maintenance</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 text-sm bg-it2p-surface border border-it2p-sand/40 text-it2p-text rounded hover:bg-it2p-sand-light transition-colors">
                  Vider le cache
                </button>
                <button className="px-4 py-2 text-sm bg-it2p-surface border border-it2p-sand/40 text-it2p-text rounded hover:bg-it2p-sand-light transition-colors">
                  Exporter les données (CSV)
                </button>
                <button className="px-4 py-2 text-sm bg-it2p-error/10 border border-it2p-error/20 text-it2p-error rounded hover:bg-it2p-error/20 transition-colors">
                  Mode maintenance
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-2.5 bg-it2p-accent text-white font-medium rounded-lg hover:bg-it2p-accent-hover transition-colors text-sm">
                Enregistrer les paramètres
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
