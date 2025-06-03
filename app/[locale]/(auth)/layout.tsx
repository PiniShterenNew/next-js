import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {

    const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}