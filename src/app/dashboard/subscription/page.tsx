'use client'

const currentPlan = {
  name: 'Essai gratuit',
  sessionsUsed: 7,
  sessionsMax: 10,
  daysLeft: 18,
}

const plan = {
  id: 'ia2p',
  name: 'Accès IT2P',
  price: '15',
  period: 'mois',
  description: 'Réservé aux praticiens certifiés Institut IA2P',
  features: [
    { label: 'Sessions illimitées' },
    { label: 'Coachés illimités' },
    { label: 'Exportation PDF des bilans' },
    { label: 'Textes descriptifs des 62 profils' },
    { label: 'Bilans collectifs' },
    { label: 'Personnalisation de marque' },
    { label: 'Support Institut IA2P' },
  ],
}

const invoices = [
  { date: '01/03/2026', amount: '15,00 €', status: 'Payée', plan: 'Accès IT2P' },
  { date: '01/02/2026', amount: '15,00 €', status: 'Payée', plan: 'Accès IT2P' },
  { date: '01/01/2026', amount: '0,00 €', status: 'Gratuit', plan: 'Essai' },
]

export default function SubscriptionPage() {
  const usedPct = currentPlan.sessionsUsed * 10 // demo display only

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-it2p-text mb-2">
            Mon abonnement
          </h1>
          <p className="text-sm sm:text-base text-it2p-text-secondary">
            Gérez votre abonnement et vos options de facturation
          </p>
        </div>

        {/* Current plan banner */}
        <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-it2p-text-secondary uppercase tracking-wide mb-1">
                Plan actuel
              </p>
              <h2 className="text-xl font-serif font-bold text-it2p-text">
                {currentPlan.name}
              </h2>
              <p className="text-sm text-it2p-warning mt-1">
                Expire dans {currentPlan.daysLeft} jours
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-it2p-text-secondary mb-2">
                Sessions utilisées
              </p>
              <p className="text-sm font-medium text-it2p-text mb-2">
                {currentPlan.sessionsUsed} sessions
              </p>
              <div className="w-full sm:w-48 h-2 bg-it2p-sand/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-it2p-accent rounded-full transition-all"
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing card */}
        <h2 className="text-lg font-serif font-semibold text-it2p-text mb-4">
          Votre abonnement
        </h2>
        <div className="max-w-sm mb-10">
          <div className="relative bg-it2p-surface rounded-lg p-6 shadow-sm border border-it2p-accent ring-2 ring-it2p-accent/20">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-it2p-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
              Praticiens certifiés IA2P
            </span>
            <div className="mb-4">
              <h3 className="text-lg font-serif font-bold text-it2p-text">{plan.name}</h3>
              <p className="text-sm text-it2p-text-secondary">{plan.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-it2p-text">{plan.price} €</span>
              <span className="text-it2p-text-secondary text-sm"> / {plan.period}</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-it2p-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-it2p-text">{f.label}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 rounded-lg font-medium text-sm bg-it2p-accent text-white hover:bg-it2p-accent-hover transition-colors">
              S&apos;abonner
            </button>
          </div>
        </div>

        {/* Billing history */}
        <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-it2p-sand/30">
            <h2 className="text-lg font-serif font-semibold text-it2p-text">
              Historique de facturation
            </h2>
          </div>
          <div className="divide-y divide-it2p-sand/20">
            {invoices.map((inv, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-it2p-text">{inv.plan}</p>
                  <p className="text-xs text-it2p-text-secondary">{inv.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-it2p-text">{inv.amount}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    inv.status === 'Payée'
                      ? 'bg-it2p-success/10 text-it2p-success'
                      : 'bg-it2p-sand/30 text-it2p-text-secondary'
                  }`}>
                    {inv.status}
                  </span>
                  <button className="text-xs text-it2p-accent hover:underline">
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing info note */}
        <p className="mt-4 text-xs text-it2p-text-secondary text-center">
          Les paiements sont sécurisés par Stripe. Annulation possible à tout moment.
        </p>
      </div>
    </div>
  )
}
