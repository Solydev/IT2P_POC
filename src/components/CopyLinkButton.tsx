'use client'

import { useState } from 'react'

interface CopyLinkButtonProps {
  link: string
  className?: string
}

export default function CopyLinkButton({ link, className = '' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
        copied
          ? 'bg-it2p-success text-white'
          : 'bg-it2p-accent text-white hover:bg-it2p-accent-hover'
      } ${className}`}
    >
      {copied ? '✓ Copié' : 'Copier le lien'}
    </button>
  )
}
