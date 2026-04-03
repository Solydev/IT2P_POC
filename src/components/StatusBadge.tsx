'use client'

interface StatusBadgeProps {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    className: 'bg-it2p-warning/10 text-it2p-warning border-it2p-warning/20',
  },
  IN_PROGRESS: {
    label: 'En cours',
    className: 'bg-it2p-info/10 text-it2p-info border-it2p-info/20',
  },
  COMPLETED: {
    label: 'Terminé',
    className: 'bg-it2p-success/10 text-it2p-success border-it2p-success/20',
  },
  EXPIRED: {
    label: 'Expiré',
    className: 'bg-it2p-error/10 text-it2p-error border-it2p-error/20',
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}
