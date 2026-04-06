// Expiration duration options for sessions
export const EXPIRATION_OPTIONS = [
  { value: 24, label: '24 heures (1 jour)' },
  { value: 48, label: '48 heures (2 jours)' },
  { value: 72, label: '72 heures (3 jours)' },
  { value: 168, label: '1 semaine (7 jours)' },
  { value: 336, label: '2 semaines (14 jours)' },
  { value: 720, label: '1 mois (30 jours)' },
] as const

export const DEFAULT_EXPIRATION_DURATION = 48 // 48 hours (2 days)

export function calculateExpirationDate(durationHours: number): Date {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + durationHours)
  return expiresAt
}

export function formatExpirationDuration(hours: number): string {
  const option = EXPIRATION_OPTIONS.find(opt => opt.value === hours)
  if (option) {
    return option.label
  }
  
  // Fallback formatting for custom durations
  if (hours < 24) {
    return `${hours} heure${hours > 1 ? 's' : ''}`
  } else if (hours < 168) {
    const days = Math.floor(hours / 24)
    return `${days} jour${days > 1 ? 's' : ''}`
  } else {
    const weeks = Math.floor(hours / 168)
    return `${weeks} semaine${weeks > 1 ? 's' : ''}`
  }
}
