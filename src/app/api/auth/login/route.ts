import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, signToken, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Verify credentials
    if (!verifyCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Get practitioner name from environment
    const name = process.env.PRACTITIONER_NAME || 'Praticien'

    // Create session token
    const token = await signToken({ email, name })
    
    // Set session cookie
    await setSessionCookie(token)

    return NextResponse.json({ 
      success: true,
      user: { email, name }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
