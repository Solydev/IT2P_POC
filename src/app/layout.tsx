import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IT2P — Institut IA2P',
  description: 'Analyse de Personnalité Professionnelle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
