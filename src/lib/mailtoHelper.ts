/**
 * Generate a pre-filled mailto link for A2P test invitation
 * @param testLink - The complete URL to the test
 * @returns mailto URL with encoded subject and body
 */
export function generateTestInvitationMailto(testLink: string): string {
  const subject = encodeURIComponent('Invitation à passer le test A2P')
  const body = encodeURIComponent(
    `Bonjour,

Je vous invite à passer le test A2P (Analyse de la Personnalité Professionnelle).

Voici votre lien personnalisé :
${testLink}

Le test prend environ 10 minutes.

Bien cordialement`
  )
  
  return `mailto:?subject=${subject}&body=${body}`
}
