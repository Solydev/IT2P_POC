'use client'

const currentPlan = {
  name: 'Essai gratuit',
  sessionsUsed: 7,
  sessionsMax: 10,
  daysLeft: 18,
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '29',
    period: 'mois',
    description: 'Pour les praticiens indépendants',
    highlight: false,
    features: [
      { label: 'Sessions illimitées', included: true },
      { label: "Jusqu\u2019\u00e0 50 coach\u00e9s actifs", included: true },
      { label: 'Exportation PDF des bilans', included: true },
      { label: 'Textes descriptifs des profils', included: true },
      { label: 'Bilans collectifs', included: false },
      { label: 'Personnalisation de marque', included: false },
      { label: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '79',
    period: 'mois',
    description: 'Pour les cabinets et équipes RH',
    highlight: true,
    features: [
      { label: 'Sessions illimitées', included: true },
      { label: 'Coachés illimités', included: true },
      { label: 'Exportation PDF des bilans', included: true },
      { label: 'Textes descriptifs des profils', included: true },
      { label: 'Bilans collectifs', included: true },
      { label: 'Personnalisation de marque', included: true },
      { label: 'Support prioritaire', included: true },
    ],
  },
]

const invoices = [
  { date: '01/03/2026', amount: '29,00 €', status: 'Payée', plan: 'Starter' },
  { date: '01/02/2026', amount: '29,00 €', status: 'Payée', plan: 'Starter' },
  { date: '01/01/2026', amount: '0,00 €', status: 'Gratuit', plan: 'Essai' },
]

export default function SubscriptionPage() {
  const usedPct = Math.round((currentPlan.sessionsUsed / currentPlan.sessionsMax) * 100)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-a2p-text mb-2">
            Mon abonnement
          </h1>
          <p className="text-sm sm:text-base text-a2p-text-secondary">
            Gérez votre abonnement et vos options de facturation
          </p>
        </div>

        {/* Current plan banner */}
        <div className="bg-a2p-surface border border-a2p-sand/30 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-a2p-text-secondary uppercase tracking-wide mb-1">
                Plan actuel
              </p>
              <h2 className="text-xl font-serif font-bold text-a2p-text">
                {currentPlan.name}
              </h2>
              <p className="text-sm text-a2p-warning mt-1">
                Expire dans {currentPlan.daysLeft} jours
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-a2p-text-secondary mb-2">
                Sessions utilisées
              </p>
              <p className="text-sm font-medium text-a2p-text mb-2">
                {currentPlan.sessionsUsed} / {currentPlan.sessionsMax}
              </p>
              <div className="w-full sm:w-48 h-2 bg-a2p-sand/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-a2p-accent rounded-full transition-all"
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <h2 className="text-lg font-serif font-semibold text-a2p-text mb-4">
          Choisir un plan
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-a2p-surface rounded-lg p-6 shadow-sm border transition-shadow hover:shadow-md ${
                plan.highlight
                  ? 'border-a2p-accent ring-2 ring-a2p-accent/20'
                  : 'border-a2p-sand/30'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-a2p-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recommandé
                </span>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-serif font-bold text-a2p-text">{plan.name}</h3>
                <p className="text-sm text-a2p-text-secondary">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-a2p-text">{plan.price} €</span>
                <span className="text-a2p-text-secondary text-sm"> / {plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <svg className="w-4 h-4 text-a2p-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-a2p-sand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={f.included ? 'text-a2p-text' : 'text-a2p-text-secondary line-through'}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-a2p-accent text-white hover:bg-a2p-accent-hover'
                    : 'bg-a2p-surface border border-a2p-sand/50 text-a2p-text hover:bg-a2p-sand-light'
                }`}
              >
                {plan.highlight ? 'Passer au Pro' : 'Choisir Starter'}
              </button>
            </div>
          ))}
        </div>

        {/* Billing history */}
        <div className="bg-a2p-surface border border-a2p-sand/30 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-a2p-sand/30">
            <h2 className="text-lg font-serif font-semibold text-a2p-text">
              Historique de facturation
            </h2>
          </div>
          <div className="divide-y divide-a2p-sand/20">
            {invoices.map((inv, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-a2p-text">{inv.plan}</p>
                  <p className="text-xs text-a2p-text-secondary">{inv.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-a2p-text">{inv.amount}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    inv.status === 'Payée'
                      ? 'bg-a2p-success/10 text-a2p-success'
                      : 'bg-a2p-sand/30 text-a2p-text-secondary'
                  }`}>
                    {inv.status}
                  </span>
                  <button className="text-xs text-a2p-accent hover:underline">
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing info note */}
        <p className="mt-4 text-xs text-a2p-text-secondary text-center">
          Les paiements sont sécurisés par Stripe. Annulation possible à tout moment.
        </p>
      </div>
    </div>
  )
}
