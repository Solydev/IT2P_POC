import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token
  const session = await verifyToken(token)
  
  // If token is invalid or expired, redirect to login
  if (!session || session.expiresAt < Math.floor(Date.now() / 1000)) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session')
    return response
  }

  // Token is valid, allow the request
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
