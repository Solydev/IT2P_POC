import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  await prisma.result.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.session.deleteMany()
  await prisma.person.deleteMany()
  await prisma.practitioner.deleteMany()

  console.log('✅ Cleaned existing data')

  // Create practitioner (credentials match .env.example)
  const practitioner = await prisma.practitioner.create({
    data: {
      email: 'demo@solydev.fr',
      passwordHash: hashPassword('demo2026'),
      name: 'S. Dunet (Démo)',
      company: 'Institut IA2P',
    },
  })

  console.log('✅ Created practitioner:', practitioner.email)

  // Create persons
  const jeanDupont = await prisma.person.create({
    data: {
      practitionerId: practitioner.id,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
    },
  })

  const marieMartin = await prisma.person.create({
    data: {
      practitionerId: practitioner.id,
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@example.com',
    },
  })

  const pierreDubois = await prisma.person.create({
    data: {
      practitionerId: practitioner.id,
      firstName: 'Pierre',
      lastName: 'Dubois',
    },
  })

  console.log('✅ Created persons: Jean Dupont, Marie Martin, Pierre Dubois')

  // ────────────────────────────────────────────────────────────────────────────
  // COMPLETED session — real 14-question A2P answers, pre-computed scores
  //
  // Réponses choisies pour Jean Dupont :
  //   Q1:C  Q2:B  Q3:D  Q4:A  Q5:C  Q6:D  Q7:A  Q8:C
  //   Q9:D  Q10:B Q11:C Q12:A Q13:A Q14:A
  //
  // Vérification manuelle (grille mock README §5.1) :
  //   SOC (1,2,3,4,6,8,12)  : Q1:C→M, Q2:B→P, Q3:D→R, Q4:A→F, Q6:D→F,
  //                            Q8:C→F, Q12:A→[R,P]  → F=3 R=2 P=2 M=1
  //   PSY (5,7,9,10,11,13,14): Q5:C→[R,M], Q7:A→M, Q9:D→M, Q10:B→M,
  //                            Q11:C→R, Q13:A→[F,P], Q14:A→F  → F=2 R=2 P=1 M=4
  //   Total : F=5  R=4  P=3  M=5   profileCode: F5R4P3M5
  // ────────────────────────────────────────────────────────────────────────────
  const demoAnswers: { question: number; answer: string }[] = [
    { question: 1,  answer: 'C' },
    { question: 2,  answer: 'B' },
    { question: 3,  answer: 'D' },
    { question: 4,  answer: 'A' },
    { question: 5,  answer: 'C' },
    { question: 6,  answer: 'D' },
    { question: 7,  answer: 'A' },
    { question: 8,  answer: 'C' },
    { question: 9,  answer: 'D' },
    { question: 10, answer: 'B' },
    { question: 11, answer: 'C' },
    { question: 12, answer: 'A' },
    { question: 13, answer: 'A' },
    { question: 14, answer: 'A' },
  ]

  const completedSession = await prisma.session.create({
    data: {
      token: 'completed-demo-token-123',
      practitionerId: practitioner.id,
      personId: jeanDupont.id,
      status: 'COMPLETED',
      coacheeName: 'Jean Dupont',
      context: 'Accompagnement Managérial',
      completedAt: new Date('2026-04-01T10:30:00Z'),
      expiresAt: new Date('2026-04-15T23:59:59Z'),
    },
  })

  await prisma.answer.createMany({
    data: demoAnswers.map(a => ({ sessionId: completedSession.id, ...a })),
  })

  await prisma.result.create({
    data: {
      sessionId: completedSession.id,
      scoreF: 5,
      scoreR: 4,
      scoreP: 3,
      scoreM: 5,
      profileCode: 'F5R4P3M5',
      profileName: 'PROFIL DE DÉMONSTRATION',
      profileVariant: 'Algorithme prototype — la grille officielle IA2P sera intégrée en production',
    },
  })

  console.log('✅ Created COMPLETED session (Jean Dupont, F5R4P3M5)')

  // PENDING session — link ready to share
  await prisma.session.create({
    data: {
      token: 'pending-demo-token-456',
      practitionerId: practitioner.id,
      personId: marieMartin.id,
      status: 'PENDING',
      coacheeName: 'Marie Martin',
      context: 'Recrutement KEOPS',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // expires in 48 h
    },
  })

  console.log('✅ Created PENDING session (Marie Martin)')

  // EXPIRED session
  await prisma.session.create({
    data: {
      token: 'expired-demo-token-789',
      practitionerId: practitioner.id,
      personId: pierreDubois.id,
      status: 'EXPIRED',
      coacheeName: 'Pierre Dubois',
      context: 'Bilan de compétences',
      expiresAt: new Date('2026-03-25T23:59:59Z'),
    },
  })

  console.log('✅ Created EXPIRED session (Pierre Dubois)')

  console.log(`
🎉 Seed terminé !

📊 Résumé :
  - Praticien  : demo@solydev.fr  /  demo2026
  - Persons    :
      • Jean Dupont (jean.dupont@example.com)
      • Marie Martin (marie.martin@example.com)
      • Pierre Dubois
  - Sessions   :
      • COMPLETED  completed-demo-token-123  (Jean Dupont — F5 R4 P3 M5)
      • PENDING    pending-demo-token-456    (Marie Martin — lien valide 48 h)
      • EXPIRED    expired-demo-token-789    (Pierre Dubois)
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
