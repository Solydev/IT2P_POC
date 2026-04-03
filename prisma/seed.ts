import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Simple password hashing (for demo purposes)
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  await prisma.result.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.session.deleteMany()
  await prisma.practitioner.deleteMany()

  console.log('✅ Cleaned existing data')

  // Create practitioner
  const practitioner = await prisma.practitioner.create({
    data: {
      email: 'demo@solydev.fr',
      passwordHash: hashPassword('demo2026'),
      name: 'S. Dunet',
      institution: 'Institut IA2P',
    },
  })

  console.log('✅ Created practitioner:', practitioner.email)

  // Create COMPLETED session with answers and result
  const completedSession = await prisma.session.create({
    data: {
      token: 'completed-demo-token-123',
      practitionerId: practitioner.id,
      status: 'COMPLETED',
      patientName: 'Jean Dupont',
      patientAge: 45,
      patientGender: 'M',
      completedAt: new Date('2026-04-01T10:30:00Z'),
      expiresAt: new Date('2026-04-15T23:59:59Z'),
    },
  })

  // Create sample answers for the completed session (40 questions with values 1-5)
  const answers = []
  for (let i = 1; i <= 40; i++) {
    answers.push({
      sessionId: completedSession.id,
      questionId: `q${i}`,
      value: Math.floor(Math.random() * 5) + 1, // Random value 1-5
    })
  }

  await prisma.answer.createMany({
    data: answers,
  })

  // Create result for completed session
  await prisma.result.create({
    data: {
      sessionId: completedSession.id,
      scoreIntrapersonnel: 42,
      scoreInterpersonnel: 38,
      scoreIdentitaire: 35,
      scoreEnvironnemental: 40,
      scoreTotal: 155,
      interpretation: 'Profil équilibré avec une légère dominante intrapersonnelle',
    },
  })

  console.log('✅ Created COMPLETED session with answers and result')

  // Create PENDING session (waiting for patient to complete)
  const pendingSession = await prisma.session.create({
    data: {
      token: 'pending-demo-token-456',
      practitionerId: practitioner.id,
      status: 'PENDING',
      patientName: 'Marie Martin',
      patientAge: 32,
      patientGender: 'F',
      expiresAt: new Date('2026-04-10T23:59:59Z'),
    },
  })

  console.log('✅ Created PENDING session')

  // Create EXPIRED session
  const expiredSession = await prisma.session.create({
    data: {
      token: 'expired-demo-token-789',
      practitionerId: practitioner.id,
      status: 'EXPIRED',
      patientName: 'Pierre Dubois',
      patientAge: 58,
      patientGender: 'M',
      expiresAt: new Date('2026-03-25T23:59:59Z'),
    },
  })

  console.log('✅ Created EXPIRED session')

  console.log('🎉 Seed completed successfully!')
  console.log(`
📊 Summary:
  - 1 Practitioner: ${practitioner.email}
  - 3 Sessions:
    • COMPLETED: ${completedSession.token} (with 40 answers + result)
    • PENDING: ${pendingSession.token}
    • EXPIRED: ${expiredSession.token}
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
