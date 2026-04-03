import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from './layout-client'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayoutClient practitionerName={session.name}>
      {children}
    </DashboardLayoutClient>
  )
}
