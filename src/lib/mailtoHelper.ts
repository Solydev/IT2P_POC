/**
 * Generate a pre-filled mailto link for A2P test invitation
 * @param testLink - The complete URL to the test
 * @returns mailto URL with encoded subject and body
 */
export function generateTestInvitationMailto(testLink: string): string {
  const subject = encodeURIComponent('Invitation à passer le test A2P')
  
  // Well-formatted plain text email with professional structure
  const body = encodeURIComponent(
    `╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                       A 2 P                                   ║
║       Analyse de la Personnalité Professionnelle             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝


Bonjour,

Je vous invite à passer le test A2P (Analyse de la Personnalité 
Professionnelle).

Ce test vous permettra d'obtenir une analyse détaillée de votre 
personnalité professionnelle et de mieux comprendre vos forces 
et vos axes de développement.


┌─────────────────────────────────────────────────────────────┐
│  🔗  VOTRE LIEN PERSONNALISÉ                                │
│                                                             │
│  ${testLink}
│                                                             │
│  ► Cliquez sur le lien ci-dessus pour commencer            │
└─────────────────────────────────────────────────────────────┘


ℹ️  INFORMATIONS PRATIQUES
   
   • Durée estimée : environ 10 minutes
   • Le test peut être interrompu et repris à tout moment
   • Vos réponses sont confidentielles et sécurisées


N'hésitez pas à me contacter si vous avez des questions.

Bien cordialement


───────────────────────────────────────────────────────────────
Institut de l'Analyse de la Personnalité Professionnelle (IA2P)
`
  )
  
  return `mailto:?subject=${subject}&body=${body}`
}
