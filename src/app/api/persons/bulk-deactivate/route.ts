import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST /api/persons/bulk-deactivate
 * Deactivate multiple persons at once
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

    // Get person IDs from request body
    const body = await request.json()
    const { personIds } = body

    // Validate personIds array
    if (!Array.isArray(personIds) || personIds.length === 0) {
      return NextResponse.json(
        { error: 'Liste d\'identifiants de personnes invalide' },
        { status: 400 }
      )
    }

    // Verify all persons belong to this practitioner before deactivating
    const persons = await prisma.person.findMany({
      where: {
        id: { in: personIds },
        practitionerId: practitioner.id,
      },
    })

    // Check if all persons were found and belong to practitioner
    if (persons.length !== personIds.length) {
      return NextResponse.json(
        { error: 'Une ou plusieurs personnes sont introuvables ou vous n\'y avez pas accès' },
        { status: 403 }
      )
    }

    // Deactivate all persons
    const result = await prisma.person.updateMany({
      where: {
        id: { in: personIds },
        practitionerId: practitioner.id,
      },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} personne(s) désactivée(s)`,
    })
  } catch (error) {
    console.error('Error bulk deactivating persons:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la désactivation des personnes' },
      { status: 500 }
    )
  }
}
