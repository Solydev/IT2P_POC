import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const body = await request.json()
    const { question, answer } = body

    // Validate input presence
    if (!question || !answer) {
      return Response.json(
        { error: 'question et answer sont requis' },
        { status: 400 }
      )
    }

    // Validate question number (1–14)
    const questionNum = parseInt(question.toString(), 10)
    if (isNaN(questionNum) || questionNum < 1 || questionNum > 14) {
      return Response.json(
        { error: 'Numéro de question invalide (1–14)' },
        { status: 400 }
      )
    }

    // Questions 12 and 13 only have options A/B
    const binaryQuestions = [12, 13]
    const validOptions = binaryQuestions.includes(questionNum)
      ? ['A', 'B']
      : ['A', 'B', 'C', 'D']
    if (!validOptions.includes(answer)) {
      return Response.json(
        { error: `Réponse invalide pour la question ${questionNum}` },
        { status: 400 }
      )
    }

    // Find session by token
    const session = await prisma.session.findUnique({
      where: { token },
    })

    if (!session) {
      return Response.json(
        { error: 'Token invalide' },
        { status: 404 }
      )
    }

    // Check if expired
    if (session.expiresAt && new Date() > session.expiresAt) {
      return Response.json(
        { error: 'Ce test a expiré' },
        { status: 410 }
      )
    }

    // Check if completed
    if (session.status === 'COMPLETED') {
      return Response.json(
        { error: 'Ce test a déjà été complété' },
        { status: 410 }
      )
    }

    // Upsert answer (store letter directly)
    await prisma.answer.upsert({
      where: {
        sessionId_question: {
          sessionId: session.id,
          question: questionNum,
        },
      },
      update: { answer },
      create: {
        sessionId: session.id,
        question: questionNum,
        answer,
      },
    })

    // Update session status to IN_PROGRESS if it was PENDING
    if (session.status === 'PENDING') {
      await prisma.session.update({
        where: { id: session.id },
        data: { status: 'IN_PROGRESS' },
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/test/[token]/answer:', error)
    return Response.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
