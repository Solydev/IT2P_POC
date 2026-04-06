import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculateExpirationDate, DEFAULT_EXPIRATION_DURATION } from '@/lib/expirationOptions'

/**
 * PATCH /api/sessions/[id]/extend
 * Extend the expiration of a session
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

    // Don't allow extending completed sessions
    if (existingSession.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Impossible de prolonger une session terminée' },
        { status: 400 }
      )
    }

    // Parse request body for optional new duration
    const body = await request.json()
    const { additionalHours } = body

    // Calculate new expiration date
    // If additionalHours is provided, add to current expiration
    // Otherwise, extend by the original duration
    let newExpiresAt: Date
    if (additionalHours) {
      newExpiresAt = existingSession.expiresAt 
        ? new Date(existingSession.expiresAt.getTime() + additionalHours * 60 * 60 * 1000)
        : calculateExpirationDate(additionalHours)
    } else {
      // Extend by the original duration from now
      const durationHours = existingSession.expirationDuration || DEFAULT_EXPIRATION_DURATION
      newExpiresAt = calculateExpirationDate(durationHours)
    }

    // Update the session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
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
    console.error('Error extending session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la prolongation de la session' },
      { status: 500 }
    )
  }
}
