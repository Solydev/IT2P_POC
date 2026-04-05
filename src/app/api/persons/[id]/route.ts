import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/persons/[id]
 * Get person details with sessions
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

    // Get person ID from params
    const { id } = await params

    // Get person with sessions
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { answers: true },
            },
            result: {
              select: { profileCode: true },
            },
          },
        },
      },
    })

    // Check if person exists
    if (!person) {
      return NextResponse.json(
        { error: 'Personne non trouvée' },
        { status: 404 }
      )
    }

    // Check if person belongs to this practitioner
    if (person.practitionerId !== practitioner.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    return NextResponse.json({ person })
  } catch (error) {
    console.error('Error fetching person:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la personne' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/persons/[id]
 * Update person details
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

    // Get person ID from params
    const { id } = await params

    // Get person to verify ownership
    const person = await prisma.person.findUnique({
      where: { id },
    })

    // Check if person exists
    if (!person) {
      return NextResponse.json(
        { error: 'Personne non trouvée' },
        { status: 404 }
      )
    }

    // Check if person belongs to this practitioner
    if (person.practitionerId !== practitioner.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Get update data from request body
    const body = await request.json()
    const { firstName, lastName, email } = body

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Le prénom et le nom sont requis' },
        { status: 400 }
      )
    }

    // Update person
    const updatedPerson = await prisma.person.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email?.trim() || null,
      },
    })

    return NextResponse.json({ person: updatedPerson })
  } catch (error) {
    console.error('Error updating person:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la personne' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/persons/[id]
 * Delete a person
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

    // Get person ID from params
    const { id } = await params

    // Get person to verify ownership
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    })

    // Check if person exists
    if (!person) {
      return NextResponse.json(
        { error: 'Personne non trouvée' },
        { status: 404 }
      )
    }

    // Check if person belongs to this practitioner
    if (person.practitionerId !== practitioner.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Check if person has sessions
    if (person._count.sessions > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une personne avec des sessions. Supprimez d\'abord les sessions.' },
        { status: 400 }
      )
    }

    // Delete the person
    await prisma.person.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting person:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la personne' },
      { status: 500 }
    )
  }
}
