import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import RoueA2P from '@/components/RoueA2P'
import StatusBadge from '@/components/StatusBadge'
import ComingSoon from '@/components/ComingSoon'

interface PageProps {
  params: Promise<{ id: string }>
}

type SessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'

function getGenderLabel(gender: string): string {
  switch (gender) {
    case 'M':
      return 'Masculin'
    case 'F':
      return 'Féminin'
    default:
      return 'Autre'
  }
}

export default async function SessionPage({ params }: PageProps) {
  // Check authentication
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  // Get practitioner
  const practitioner = await prisma.practitioner.findUnique({
    where: { email: session.email },
  })

  if (!practitioner) {
    redirect('/login')
  }

  // Get session ID
  const { id } = await params

  // Get session with answers and result
  const sessionData = await prisma.session.findUnique({
    where: { id },
    include: {
      answers: {
        orderBy: { questionId: 'asc' }
      },
      result: true
    }
  })

  // Check if session exists
  if (!sessionData) {
    notFound()
  }

  // Check if session belongs to this practitioner
  if (sessionData.practitionerId !== practitioner.id) {
    notFound()
  }

  // Check if session has a result
  if (!sessionData.result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-serif font-bold text-it2p-text mb-4">
            Résultat non disponible
          </h1>
          <p className="text-it2p-text-secondary mb-6">
            Cette session n&apos;a pas encore été complétée ou n&apos;a pas de résultat calculé.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-it2p-accent text-white rounded hover:bg-it2p-accent-hover transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  const result = sessionData.result

  // Map database fields to F/R/P/M scores
  // Based on the Result model:
  // scoreIntrapersonnel -> F (Flexibility/Personal)
  // scoreInterpersonnel -> R (Relationship)
  // scoreIdentitaire -> P (Position/Identity)
  // scoreEnvironnemental -> M (Matter/Environment)
  const scores = {
    F: result.scoreIntrapersonnel,
    R: result.scoreInterpersonnel,
    P: result.scoreIdentitaire,
    M: result.scoreEnvironnemental,
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Prepare metadata for RoueA2P
  const metadata = {
    date: formatDate(sessionData.createdAt),
    analysedFor: 'Bilan A2P',
    coacheeName: sessionData.patientName || undefined,
    profileCode: `F${scores.F}R${scores.R}P${scores.P}M${scores.M}`,
    profileName: result.interpretation || 'PROFIL DE DÉMONSTRATION',
    resultCode: `F${scores.F} R${scores.R} P${scores.P} M${scores.M}`,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-it2p-accent hover:text-it2p-accent-hover transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au tableau de bord
        </Link>
      </div>

      {/* Session header */}
      <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-it2p-text mb-2">
              Résultat de la session
            </h1>
            <p className="text-it2p-text-secondary">
              Session créée le {formatDate(sessionData.createdAt)}
              {sessionData.completedAt && (
                <> • Complétée le {formatDate(sessionData.completedAt)}</>
              )}
            </p>
          </div>
          <StatusBadge status={sessionData.status as SessionStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-it2p-text">Coaché(e):</span>
            <span className="ml-2 text-it2p-text-secondary">
              {sessionData.patientName || 'Non renseigné'}
            </span>
          </div>
          {sessionData.patientAge && (
            <div>
              <span className="font-medium text-it2p-text">Âge:</span>
              <span className="ml-2 text-it2p-text-secondary">
                {sessionData.patientAge} ans
              </span>
            </div>
          )}
          {sessionData.patientGender && (
            <div>
              <span className="font-medium text-it2p-text">Genre:</span>
              <span className="ml-2 text-it2p-text-secondary">
                {getGenderLabel(sessionData.patientGender)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: RoueA2P */}
        <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-6 shadow-sm flex flex-col items-center">
          <h2 className="text-2xl font-serif font-bold text-it2p-text mb-6">Roue A2P</h2>
          <RoueA2P scores={scores} metadata={metadata} />
        </div>

        {/* Right column: Scores and Profile */}
        <div className="space-y-6">
          {/* Score cards */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-it2p-text mb-4">Scores</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-it2p-text-secondary mb-1">
                  F - Flexibility
                </div>
                <div className="text-3xl font-bold text-it2p-accent">
                  {scores.F}
                </div>
              </div>

              <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-it2p-text-secondary mb-1">
                  R - Relationship
                </div>
                <div className="text-3xl font-bold text-it2p-accent">
                  {scores.R}
                </div>
              </div>

              <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-it2p-text-secondary mb-1">
                  P - Position
                </div>
                <div className="text-3xl font-bold text-it2p-accent">
                  {scores.P}
                </div>
              </div>

              <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-it2p-text-secondary mb-1">
                  M - Matter
                </div>
                <div className="text-3xl font-bold text-it2p-accent">
                  {scores.M}
                </div>
              </div>
            </div>

            <div className="bg-it2p-sand-light border border-it2p-sand rounded-lg p-4 shadow-sm mt-4">
              <div className="text-sm font-medium text-it2p-text-secondary mb-1">
                Score total
              </div>
              <div className="text-3xl font-bold text-it2p-text">
                {result.scoreTotal}
              </div>
            </div>
          </div>

          {/* Profile section */}
          <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-it2p-text mb-4">Profil</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-it2p-text-secondary mb-1">
                  Code profil
                </div>
                <div className="text-xl font-mono font-bold text-it2p-accent">
                  {metadata.profileCode}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-it2p-text-secondary mb-1">
                  Désignation
                </div>
                <div className="text-lg font-medium text-it2p-text">
                  {metadata.profileName}
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon sections */}
          <div className="space-y-4">
            {/* Profile description */}
            <ComingSoon>
              <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-serif font-bold text-it2p-text mb-3">
                  Texte descriptif du profil
                </h3>
                <p className="text-it2p-text-secondary text-sm leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                  eu fugiat nulla pariatur.
                </p>
              </div>
            </ComingSoon>

            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ComingSoon>
                <button
                  disabled
                  className="w-full px-4 py-3 bg-it2p-accent text-white rounded hover:bg-it2p-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  📄 Exporter en PDF
                </button>
              </ComingSoon>

              <ComingSoon>
                <button
                  disabled
                  className="w-full px-4 py-3 bg-it2p-surface border border-it2p-sand text-it2p-text rounded hover:bg-it2p-sand-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ✏️ Saisie manuelle
                </button>
              </ComingSoon>
            </div>

            {/* Soc/Psy toggle */}
            <ComingSoon>
              <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-4 shadow-sm">
                <label className="flex items-center gap-3 cursor-not-allowed">
                  <input
                    type="checkbox"
                    disabled
                    className="w-5 h-5 text-it2p-accent rounded border-gray-300 focus:ring-it2p-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-it2p-text">
                    Afficher l&apos;analyse Soc/Psy séparément
                  </span>
                </label>
              </div>
            </ComingSoon>
          </div>
        </div>
      </div>
    </div>
  )
}
