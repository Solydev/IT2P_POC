'use client'

import { useState } from 'react'

const accentColors = [
  { label: 'Bleu IT2P', value: '#2E5A88' },
  { label: 'Vert sauge', value: '#4A7C59' },
  { label: 'Terracotta', value: '#B85C38' },
  { label: 'Prune', value: '#6B3FA0' },
  { label: 'Gris ardoise', value: '#4A5568' },
]

export default function CustomizationPage() {
  const [selectedColor, setSelectedColor] = useState('#2E5A88')
  const [practitionerName, setPractitionerName] = useState('Dr. Marie Dupont')
  const [practitionerTitle, setPractitionerTitle] = useState('Coach & Consultante RH')
  const [emailFooter, setEmailFooter] = useState(
    'Cabinet Dupont Conseil · 12 rue de la Paix, Paris · contact@dupont-conseil.fr'
  )
  const [logoPlaceholder] = useState(false)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-a2p-text mb-2">
            Personnalisation
          </h1>
          <p className="text-sm sm:text-base text-a2p-text-secondary">
            Adaptez l&apos;apparence des rapports et des emails envoyés à vos coachés
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* Settings panel */}
          <div className="lg:col-span-3 space-y-6">

            {/* Identity */}
            <div className="bg-a2p-surface border border-a2p-sand/30 rounded-lg p-6 shadow-sm">
              <h2 className="text-base font-semibold text-a2p-text mb-4">
                Identité du praticien
              </h2>

              {/* Logo upload */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-a2p-text mb-2">
                  Logo / Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-a2p-sand-light border-2 border-dashed border-a2p-sand flex items-center justify-center flex-shrink-0">
                    {logoPlaceholder ? (
                      <img src="" alt="logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <svg className="w-7 h-7 text-a2p-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <button className="px-4 py-2 text-sm bg-a2p-surface border border-a2p-sand/50 text-a2p-text rounded hover:bg-a2p-sand-light transition-colors">
                      Choisir un fichier
                    </button>
                    <p className="text-xs text-a2p-text-secondary mt-1">PNG, JPG — max. 2 Mo</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-a2p-text mb-1">
                    Nom affiché
                  </label>
                  <input
                    type="text"
                    value={practitionerName}
                    onChange={(e) => setPractitionerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-a2p-sand/50 rounded-lg bg-a2p-bg text-a2p-text focus:outline-none focus:ring-2 focus:ring-a2p-accent/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-a2p-text mb-1">
                    Titre / Fonction
                  </label>
                  <input
                    type="text"
                    value={practitionerTitle}
                    onChange={(e) => setPractitionerTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-a2p-sand/50 rounded-lg bg-a2p-bg text-a2p-text focus:outline-none focus:ring-2 focus:ring-a2p-accent/30"
                  />
                </div>
              </div>
            </div>

            {/* Brand color */}
            <div className="bg-a2p-surface border border-a2p-sand/30 rounded-lg p-6 shadow-sm">
              <h2 className="text-base font-semibold text-a2p-text mb-1">
                Couleur principale
              </h2>
              <p className="text-xs text-a2p-text-secondary mb-4">
                Utilisée dans les rapports PDF et les emails envoyés à vos coachés
              </p>
              <div className="flex flex-wrap gap-3">
                {accentColors.map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => setSelectedColor(c.value)}
                    className={`w-9 h-9 rounded-full transition-transform hover:scale-110 ring-offset-2 ${
                      selectedColor === c.value ? 'ring-2 ring-a2p-text scale-110' : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
                <label className="w-9 h-9 rounded-full border-2 border-dashed border-a2p-sand flex items-center justify-center cursor-pointer hover:bg-a2p-sand-light transition-colors" title="Couleur personnalisée">
                  <span className="text-xs text-a2p-text-secondary">+</span>
                  <input type="color" className="sr-only" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} />
                </label>
              </div>
            </div>

            {/* Email footer */}
            <div className="bg-a2p-surface border border-a2p-sand/30 rounded-lg p-6 shadow-sm">
              <h2 className="text-base font-semibold text-a2p-text mb-1">
                Pied de page des emails
              </h2>
              <p className="text-xs text-a2p-text-secondary mb-4">
                Affiché en bas de chaque email envoyé à vos coachés
              </p>
              <textarea
                rows={3}
                value={emailFooter}
                onChange={(e) => setEmailFooter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-a2p-sand/50 rounded-lg bg-a2p-bg text-a2p-text focus:outline-none focus:ring-2 focus:ring-a2p-accent/30 resize-none"
              />
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <button className="px-6 py-2.5 bg-a2p-accent text-white font-medium rounded-lg hover:bg-a2p-accent-hover transition-colors text-sm">
                Enregistrer les modifications
              </button>
            </div>
          </div>

          {/* Preview panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <p className="text-xs font-medium text-a2p-text-secondary uppercase tracking-wide mb-3">
                Aperçu — Email d&apos;invitation
              </p>
              <div className="bg-white border border-a2p-sand/40 rounded-xl overflow-hidden shadow-md text-xs">
                {/* Email header */}
                <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: selectedColor }}>
                  <p className="font-bold text-white text-sm">{practitionerName}</p>
                  <p className="text-white/80 text-xs">{practitionerTitle}</p>
                </div>
                {/* Email body */}
                <div className="px-5 py-5 space-y-3 text-gray-700">
                  <p className="font-medium text-gray-900">Bonjour Marie,</p>
                  <p>
                    Je vous invite à compléter votre inventaire IT2P. Cela prend environ 15 minutes.
                  </p>
                  <div className="text-center py-3">
                    <span
                      className="inline-block px-5 py-2.5 text-white rounded font-medium text-xs"
                      style={{ backgroundColor: selectedColor }}
                    >
                      Accéder à mon questionnaire
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Lien valable 7 jours. Ne partagez pas ce lien.
                  </p>
                </div>
                {/* Email footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-gray-400 leading-relaxed">{emailFooter}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
