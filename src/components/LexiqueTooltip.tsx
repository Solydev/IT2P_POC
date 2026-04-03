'use client'

import { useState } from 'react'
import { LexiqueEntry } from '@/lib/questions'

interface LexiqueTooltipProps {
  entries: LexiqueEntry[];
}

export default function LexiqueTooltip({ entries }: LexiqueTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!entries || entries.length === 0) {
    return null
  }

  return (
    <div className="mt-6 border-t border-it2p-sand pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-it2p-accent hover:text-it2p-accent-hover font-medium text-sm transition-colors"
        type="button"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Lexique ({entries.length} {entries.length === 1 ? 'terme' : 'termes'})
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-3 pl-6">
          {entries.map((entry, index) => (
            <div key={index} className="text-sm">
              <dt className="font-semibold text-it2p-text">
                {entry.term}
              </dt>
              <dd className="mt-1 text-it2p-text-secondary">
                {entry.definition}
              </dd>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
