import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/sessions/[id]
 * Get session details with answers and result
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Get session ID from params
    const { id } = await params

    // Get session with answers and result
    const sessionData = await prisma.session.findUnique({
      where: { id },
      include: {
        answers: {
          orderBy: { questionId: 'asc' }
        },
        result: true
      }
    })

    // Check if session exists
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Check if session belongs to this practitioner
    if (sessionData.practitionerId !== practitioner.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    return NextResponse.json({ session: sessionData })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la session' },
      { status: 500 }
    )
  }
}
