import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const body = await request.json()
    const { questionId, answer } = body

    // Validate input
    if (!questionId || !answer) {
      return Response.json(
        { error: 'questionId et answer sont requis' },
        { status: 400 }
      )
    }

    // Validate answer is A, B, C, or D
    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      return Response.json(
        { error: 'La réponse doit être A, B, C ou D' },
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

    // Convert letter (A,B,C,D) to index (0,1,2,3) for storage
    const answerIndex = ['A', 'B', 'C', 'D'].indexOf(answer)

    // Upsert answer
    await prisma.answer.upsert({
      where: {
        sessionId_questionId: {
          sessionId: session.id,
          questionId: questionId.toString(),
        },
      },
      update: {
        value: answerIndex,
      },
      create: {
        sessionId: session.id,
        questionId: questionId.toString(),
        value: answerIndex,
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
