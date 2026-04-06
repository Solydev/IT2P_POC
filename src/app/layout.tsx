import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'A2P - Institut IA2P',
  description: 'Analyse de la Personnalité Professionnelle',
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
