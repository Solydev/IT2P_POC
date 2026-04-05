import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

/**
 * GET /api/sessions
 * List all sessions for the authenticated practitioner, sorted by creation date (desc)
 */
export async function GET() {
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

    // Get all sessions for this practitioner
    const sessions = await prisma.session.findMany({
      where: { practitionerId: practitioner.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { answers: true } },
        result: true,
        person: true,
      },
    })

    // Normalize expired sessions (status may still be PENDING/IN_PROGRESS in DB)
    const now = new Date()
    const normalizedSessions = sessions.map(s => ({
      ...s,
      status:
        (s.status === 'PENDING' || s.status === 'IN_PROGRESS') &&
        s.expiresAt &&
        s.expiresAt < now
          ? 'EXPIRED'
          : s.status,
    }))

    return NextResponse.json({ sessions: normalizedSessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sessions
 * Create a new session with a unique token and 48h expiration
 * Supports either personId (new approach) or coacheeName (legacy)
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { personId, coacheeName, context } = body

    // If personId is provided, verify it belongs to this practitioner
    if (personId) {
      const person = await prisma.person.findUnique({
        where: { id: personId },
      })

      if (!person) {
        return NextResponse.json(
          { error: 'Personne non trouvée' },
          { status: 404 }
        )
      }

      if (person.practitionerId !== practitioner.id) {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        )
      }
    }

    // Generate unique token and set expiration to 48h from now
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)

    // Create session with either personId or coacheeName
    const newSession = await prisma.session.create({
      data: {
        token,
        practitionerId: practitioner.id,
        personId: personId || null,
        status: 'PENDING',
        coacheeName: coacheeName?.trim() || null,
        context: context?.trim() || null,
        expiresAt,
      },
      include: {
        person: true,
      },
    })

    // Generate test link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const testLink = `${appUrl}/test/${token}`

    return NextResponse.json({
      session: newSession,
      testLink,
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
}
