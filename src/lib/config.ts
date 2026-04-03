/**
 * Get the application base URL
 * On the client, this is evaluated at build time from NEXT_PUBLIC_APP_URL
 * On the server, it can be dynamically determined from the request
 */
export function getAppUrl(): string {
  // In production, this should come from environment variable at build time
  // or be configured in a centralized config file
  if (typeof window !== 'undefined') {
    // Client-side: use the current origin
    return window.location.origin
  }
  
  // Server-side fallback to environment variable
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}
