import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-to-a-random-32-char-string'
const SESSION_COOKIE_NAME = 'session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

// Convert secret to Uint8Array for jose
const getSecretKey = () => new TextEncoder().encode(SESSION_SECRET)

export interface SessionPayload {
  email: string
  name: string
  expiresAt: number
}

/**
 * Sign a JWT token with the session payload
 */
export async function signToken(payload: Omit<SessionPayload, 'expiresAt'>): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  const token = await new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .sign(getSecretKey())
  
  return token
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    // Validate payload has required fields
    if (
      payload &&
      typeof payload.email === 'string' &&
      typeof payload.name === 'string' &&
      typeof payload.expiresAt === 'number'
    ) {
      return {
        email: payload.email,
        name: payload.name,
        expiresAt: payload.expiresAt,
      }
    }
    return null
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Set the session cookie in the response
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * Get the session cookie from the request
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Get the current session if authenticated
 */
export async function getSession(): Promise<SessionPayload | null> {
  const token = await getSessionCookie()
  if (!token) return null
  
  const session = await verifyToken(token)
  if (!session) return null
  
  // Check if session has expired
  if (session.expiresAt < Math.floor(Date.now() / 1000)) {
    await clearSessionCookie()
    return null
  }
  
  return session
}

/**
 * Verify credentials against environment variables
 */
export function verifyCredentials(email: string, password: string): boolean {
  const validEmail = process.env.PRACTITIONER_EMAIL
  const validPassword = process.env.PRACTITIONER_PASSWORD
  
  if (!validEmail || !validPassword) {
    console.error('PRACTITIONER_EMAIL or PRACTITIONER_PASSWORD not set in environment')
    return false
  }
  
  return email === validEmail && password === validPassword
}
