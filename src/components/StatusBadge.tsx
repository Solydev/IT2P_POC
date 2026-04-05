'use client'

interface StatusBadgeProps {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    className: 'bg-a2p-warning/10 text-a2p-warning border-a2p-warning/20',
  },
  IN_PROGRESS: {
    label: 'En cours',
    className: 'bg-a2p-info/10 text-a2p-info border-a2p-info/20',
  },
  COMPLETED: {
    label: 'Terminé',
    className: 'bg-a2p-success/10 text-a2p-success border-a2p-success/20',
  },
  EXPIRED: {
    label: 'Expiré',
    className: 'bg-a2p-error/10 text-a2p-error border-a2p-error/20',
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}
