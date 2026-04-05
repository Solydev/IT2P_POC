'use client'

interface ComingSoonProps {
  children: React.ReactNode
  inline?: boolean
}

/**
 * ComingSoon component - displays an overlay or badge for features not yet available
 * Can be used as an overlay wrapper or inline badge
 */
export default function ComingSoon({ children, inline = false }: ComingSoonProps) {
  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        {children}
        <span className="text-xs font-medium text-a2p-coming-soon bg-a2p-coming-soon/10 px-2 py-0.5 rounded">
          Bientôt
        </span>
      </span>
    )
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-a2p-surface/60 backdrop-blur-sm rounded">
        <span className="bg-a2p-coming-soon/20 text-a2p-coming-soon px-4 py-2 rounded-lg font-medium text-sm">
          Bientôt disponible
        </span>
      </div>
    </div>
  )
}
