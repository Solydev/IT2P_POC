import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { computeScores } from '@/lib/scoring'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // Find session by token with answers
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        answers: true,
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
        { error: 'Ce test a expiré' },
        { status: 410 }
      )
    }

    // Check if already completed
    if (session.status === 'COMPLETED') {
      return Response.json(
        { error: 'Ce test a déjà été complété' },
        { status: 410 }
      )
    }

    // Verify all 14 questions are answered
    if (session.answers.length !== 14) {
      return Response.json(
        { 
          error: 'Toutes les 14 questions doivent être répondues',
          answeredCount: session.answers.length 
        },
        { status: 400 }
      )
    }

    // Convert answers to format expected by scoring function
    const answersMap: Record<number, string> = {}
    for (const ans of session.answers) {
      answersMap[ans.question] = ans.answer
    }

    // Compute scores
    const result = computeScores(answersMap)

    // Save result to database
    await prisma.result.create({
      data: {
        sessionId: session.id,
        scoreF: result.totalScores.F,
        scoreR: result.totalScores.R,
        scoreP: result.totalScores.P,
        scoreM: result.totalScores.M,
        profileCode: result.profileCode,
        profileName: result.profileName,
        profileVariant: result.profileVariant,
      },
    })

    // Update session status to COMPLETED
    await prisma.session.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    return Response.json({
      success: true,
      result: {
        profileCode: result.profileCode,
        profileName: result.profileName,
        scores: result.totalScores,
      },
    })
  } catch (error) {
    console.error('Error in POST /api/test/[token]/complete:', error)
    return Response.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
