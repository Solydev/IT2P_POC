'use client'

import Link from 'next/link'
import StatusBadge from './StatusBadge'
import CopyLinkButton from './CopyLinkButton'

interface SessionCardProps {
  session: {
    id: string
    token: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
    patientName: string | null
    patientAge?: number | null
    patientGender?: string | null
    createdAt: string
    expiresAt?: string | null
    completedAt?: string | null
    _count?: {
      answers: number
    }
    result?: {
      scoreTotal: number
    } | null
  }
}

export default function SessionCard({ session }: SessionCardProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const testLink = `${appUrl}/test/${session.token}`
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-it2p-surface border border-it2p-sand/30 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-it2p-text mb-1">
            {session.patientName || 'Sans nom'}
          </h3>
          <p className="text-sm text-it2p-text-secondary">
            Créé le {formatDate(session.createdAt)}
          </p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      <div className="space-y-2 mb-4">
        {session.patientAge && (
          <p className="text-sm text-it2p-text-secondary">
            <span className="font-medium">Âge:</span> {session.patientAge} ans
          </p>
        )}
        {session.expiresAt && session.status !== 'EXPIRED' && session.status !== 'COMPLETED' && (
          <p className="text-sm text-it2p-text-secondary">
            <span className="font-medium">Expire le:</span> {formatDate(session.expiresAt)}
          </p>
        )}
        {session.completedAt && (
          <p className="text-sm text-it2p-text-secondary">
            <span className="font-medium">Complété le:</span> {formatDate(session.completedAt)}
          </p>
        )}
        {session._count && session._count.answers > 0 && (
          <p className="text-sm text-it2p-text-secondary">
            <span className="font-medium">Réponses:</span> {session._count.answers}/40
          </p>
        )}
        {session.result && (
          <p className="text-sm text-it2p-text-secondary">
            <span className="font-medium">Score total:</span> {session.result.scoreTotal}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(session.status === 'PENDING' || session.status === 'IN_PROGRESS') && (
          <CopyLinkButton link={testLink} />
        )}
        {session.status === 'COMPLETED' && session.result && (
          <Link
            href={`/dashboard/session/${session.id}`}
            className="px-3 py-1.5 text-sm font-medium bg-it2p-accent text-white rounded hover:bg-it2p-accent-hover transition-colors"
          >
            Voir le bilan
          </Link>
        )}
      </div>
    </div>
  )
}
