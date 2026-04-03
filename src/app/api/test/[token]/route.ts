import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { QUESTIONS } from '@/lib/questions'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // Find session by token
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        answers: true,
        result: true,
      },
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
        { error: 'Ce test a expiré', status: 'EXPIRED' },
        { status: 410 }
      )
    }

    // Check if completed
    if (session.status === 'COMPLETED') {
      return Response.json(
        { 
          error: 'Ce test a déjà été complété',
          status: 'COMPLETED',
          completedAt: session.completedAt 
        },
        { status: 410 }
      )
    }

    // Convert answers to map: questionId -> answer letter
    const answersMap: Record<string, string> = {}
    for (const answer of session.answers) {
      // Convert stored index (0,1,2,3) back to letter (A,B,C,D)
      const letters = ['A', 'B', 'C', 'D']
      if (answer.value < 0 || answer.value > 3) {
        console.error(`Invalid answer value ${answer.value} for question ${answer.questionId}`)
        continue
      }
      answersMap[answer.questionId] = letters[answer.value]
    }

    return Response.json({
      session: {
        id: session.id,
        token: session.token,
        status: session.status,
        patientName: session.patientName,
        expiresAt: session.expiresAt,
      },
      questions: QUESTIONS,
      answers: answersMap,
    })
  } catch (error) {
    console.error('Error in GET /api/test/[token]:', error)
    return Response.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
