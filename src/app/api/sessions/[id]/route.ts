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
          orderBy: { question: 'asc' },
        },
        result: true,
      },
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

/**
 * DELETE /api/sessions/[id]
 * Delete a session
 */
export async function DELETE(
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

    // Get session to verify ownership
    const sessionData = await prisma.session.findUnique({
      where: { id },
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

    // Delete the session (answers and result will cascade delete)
    await prisma.session.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la session' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sessions/[id]
 * Update session metadata (personId, context)
 */
export async function PATCH(
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

    // Get session to verify ownership
    const sessionData = await prisma.session.findUnique({
      where: { id },
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

    // Get update data from request body
    const body = await request.json()
    const { context, personId } = body

    // Validate required field
    if (!context || !context.trim()) {
      return NextResponse.json(
        { error: 'La description est obligatoire' },
        { status: 400 }
      )
    }

    // If personId is being changed, verify it belongs to this practitioner
    if (personId && personId !== sessionData.personId) {
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

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        ...(personId && { personId }),
        context: context.trim(),
      },
      include: {
        person: true,
      },
    })

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la session' },
      { status: 500 }
    )
  }
}
