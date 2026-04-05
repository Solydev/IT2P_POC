import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/persons
 * List all persons for authenticated practitioner
 * Query params:
 *   - filter: 'all' | 'active' | 'inactive' (default: 'active')
 */
export async function GET(request: NextRequest) {
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

    // Get filter parameter from query
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'active'

    const base = { practitionerId: practitioner.id }

    // Build where clause based on filter
    let whereClause: any = { ...base }
    if (filter === 'active') {
      whereClause.isActive = true
    } else if (filter === 'inactive') {
      whereClause.isActive = false
    } else if (filter === 'with-active-session') {
      whereClause.sessions = {
        some: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      }
    }
    // 'all' doesn't add extra filter

    // Fetch filtered persons + global counts in parallel
    const [persons, countAll, countActive, countInactive, countWithActiveSession] =
      await Promise.all([
        prisma.person.findMany({
          where: whereClause,
          include: { _count: { select: { sessions: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.person.count({ where: base }),
        prisma.person.count({ where: { ...base, isActive: true } }),
        prisma.person.count({ where: { ...base, isActive: false } }),
        prisma.person.count({
          where: {
            ...base,
            sessions: { some: { status: { in: ['PENDING', 'IN_PROGRESS'] } } },
          },
        }),
      ])

    return NextResponse.json({
      persons,
      counts: {
        all: countAll,
        active: countActive,
        inactive: countInactive,
        withActiveSession: countWithActiveSession,
      },
    })
  } catch (error) {
    console.error('Error fetching persons:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des personnes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/persons
 * Create a new person
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

    // Get data from request body
    const body = await request.json()
    const { firstName, lastName, email } = body

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Le prénom et le nom sont requis' },
        { status: 400 }
      )
    }

    // Create new person
    const newPerson = await prisma.person.create({
      data: {
        practitionerId: practitioner.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email?.trim() || null,
      },
    })

    return NextResponse.json({ person: newPerson }, { status: 201 })
  } catch (error) {
    console.error('Error creating person:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la personne' },
      { status: 500 }
    )
  }
}
