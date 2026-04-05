'use client'

import { useState } from 'react'

const stats = [
  { label: 'Sessions complétées', value: '42', sub: 'sur 58 créées' },
  { label: 'Coachés uniques', value: '31', sub: 'depuis 6 mois' },
  { label: 'Taux de complétion', value: '72 %', sub: '+8 % vs mois dernier' },
  { label: 'Profil dominant', value: 'P3-A', sub: '14 occurrences' },
]

const profileDistribution = [
  { code: 'P1-A', label: 'Pôle 1 · Ancrage', count: 8, color: '#4A7C59' },
  { code: 'P2-A', label: 'Pôle 2 · Ancrage', count: 5, color: '#4A6FA5' },
  { code: 'P3-A', label: 'Pôle 3 · Ancrage', count: 14, color: '#2E5A88' },
  { code: 'P1-M', label: 'Pôle 1 · Mouvement', count: 7, color: '#B8860B' },
  { code: 'P2-M', label: 'Pôle 2 · Mouvement', count: 5, color: '#A04040' },
  { code: 'P3-M', label: 'Pôle 3 · Mouvement', count: 3, color: '#6B3FA0' },
]

const maxCount = Math.max(...profileDistribution.map((p) => p.count))

const groupSessions = [
  {
    id: 1,
    context: 'Séminaire leadership Q1 2026',
    date: '15 mars 2026',
    participants: 12,
    completed: 11,
    profiles: ['P3-A', 'P1-M', 'P3-A', 'P2-A'],
  },
  {
    id: 2,
    context: 'Bilan annuel RH – Equipe commerciale',
    date: '28 février 2026',
    participants: 8,
    completed: 8,
    profiles: ['P1-A', 'P1-M', 'P3-A', 'P2-M'],
  },
  {
    id: 3,
    context: 'Atelier cohésion – Direction générale',
    date: '10 janvier 2026',
    participants: 6,
    completed: 5,
    profiles: ['P3-A', 'P1-A', 'P3-M'],
  },
]

const periodOptions = ['3 derniers mois', '6 derniers mois', '12 derniers mois', 'Tout']

export default function ReportsPage() {
  const [period, setPeriod] = useState('6 derniers mois')
  const [expandedGroup, setExpandedGroup] = useState<number | null>(1)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-a2p-text mb-2">
              Bilans collectifs
            </h1>
            <p className="text-sm sm:text-base text-a2p-text-secondary">
              Analysez les tendances et la répartition des profils de vos coachés
            </p>
          </div>
          <button className="self-start sm:self-auto px-4 py-2.5 bg-a2p-surface border border-a2p-sand/50 text-a2p-text rounded-lg hover:bg-a2p-sand-light transition-colors text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter PDF
          </button>
        </div>

        {/* Period filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {periodOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setPeriod(opt)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                period === opt
                  ? 'bg-a2p-accent text-white'
                  : 'bg-a2p-surface border border-a2p-sand/30 text-a2p-text hover:bg-a2p-sand-light'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-a2p-surface border border-a2p-sand/30 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-a2p-text-secondary mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-a2p-text font-serif">{s.value}</p>
              <p className="text-xs text-a2p-text-secondary mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Profile distribution */}
        <div className="bg-a2p-surface border border-a2p-sand/30 rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-base font-semibold text-a2p-text mb-5">
            Répartition des profils
          </h2>
          <div className="space-y-3">
            {profileDistribution.map((p) => {
              const pct = Math.round((p.count / maxCount) * 100)
              return (
                <div key={p.code} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-a2p-text w-12 flex-shrink-0">
                    {p.code}
                  </span>
                  <div className="flex-1 h-6 bg-a2p-sand/20 rounded overflow-hidden">
                    <div
                      className="h-full rounded flex items-center px-2 transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: p.color }}
                    >
                      {pct > 20 && (
                        <span className="text-white text-xs font-medium">{p.count}</span>
                      )}
                    </div>
                  </div>
                  {pct <= 20 && (
                    <span className="text-xs text-a2p-text-secondary w-4">{p.count}</span>
                  )}
                  <span className="text-xs text-a2p-text-secondary w-32 hidden sm:block">
                    {p.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Group sessions list */}
        <h2 className="text-base font-semibold text-a2p-text mb-4">
          Sessions par groupe / contexte
        </h2>
        <div className="space-y-3">
          {groupSessions.map((group) => (
            <div
              key={group.id}
              className="bg-a2p-surface border border-a2p-sand/30 rounded-lg shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-a2p-sand-light/50 transition-colors text-left"
                onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-a2p-text truncate">{group.context}</p>
                  <p className="text-xs text-a2p-text-secondary mt-0.5">{group.date}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-a2p-text">
                      {group.completed}/{group.participants}
                    </p>
                    <p className="text-xs text-a2p-text-secondary">complétés</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-a2p-text-secondary transition-transform ${
                      expandedGroup === group.id ? 'rotate-180' : ''
                    }`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedGroup === group.id && (
                <div className="px-6 pb-5 pt-1 border-t border-a2p-sand/20">
                  <div className="grid sm:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs font-medium text-a2p-text-secondary mb-2 uppercase tracking-wide">
                        Profils identifiés
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.profiles.map((profile, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-a2p-accent/10 text-a2p-accent text-xs font-mono font-semibold rounded"
                          >
                            {profile}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-a2p-text-secondary mb-2 uppercase tracking-wide">
                        Complétion
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-a2p-sand/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-a2p-success rounded-full"
                            style={{ width: `${Math.round((group.completed / group.participants) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-a2p-text-secondary">
                          {Math.round((group.completed / group.participants) * 100)} %
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 text-xs bg-a2p-accent text-white rounded hover:bg-a2p-accent-hover transition-colors font-medium">
                      Voir le bilan détaillé
                    </button>
                    <button className="px-4 py-2 text-xs bg-a2p-surface border border-a2p-sand/40 text-a2p-text rounded hover:bg-a2p-sand-light transition-colors">
                      Exporter PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
