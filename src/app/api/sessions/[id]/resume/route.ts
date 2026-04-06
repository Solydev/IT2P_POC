import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculateExpirationDate, DEFAULT_EXPIRATION_DURATION } from '@/lib/expirationOptions'

/**
 * PATCH /api/sessions/[id]/resume
 * Resume an expired session by resetting status and extending expiration
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Get practitioner from database
    const practitioner = await prisma.practitioner.findUnique({
      where: { email: session.email },
    })

    if (!practitioner) {
      return NextResponse.json(
        { error: 'Praticien non trouvé' },
        { status: 404 }
      )
    }

    const { id } = params

    // Find the session
    const existingSession = await prisma.session.findUnique({
      where: { id },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (existingSession.practitionerId !== practitioner.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Don't allow resuming completed sessions
    if (existingSession.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Impossible de reprendre une session terminée' },
        { status: 400 }
      )
    }

    // Check if session is actually expired
    const now = new Date()
    const isExpired = existingSession.expiresAt && existingSession.expiresAt < now

    if (!isExpired && existingSession.status !== 'EXPIRED') {
      return NextResponse.json(
        { error: 'La session n\'est pas expirée' },
        { status: 400 }
      )
    }

    // Calculate new expiration date using the original duration
    const durationHours = existingSession.expirationDuration || DEFAULT_EXPIRATION_DURATION
    const newExpiresAt = calculateExpirationDate(durationHours)

    // Determine the status to set
    // If there are answers, set to IN_PROGRESS, otherwise PENDING
    const answerCount = await prisma.answer.count({
      where: { sessionId: id },
    })

    const newStatus = answerCount > 0 ? 'IN_PROGRESS' : 'PENDING'

    // Update the session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        status: newStatus,
        expiresAt: newExpiresAt,
      },
      include: {
        person: true,
        _count: { select: { answers: true } },
        result: true,
      },
    })

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('Error resuming session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la reprise de la session' },
      { status: 500 }
    )
  }
}
