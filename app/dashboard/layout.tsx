import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content with margin for desktop sidebar */}
      <div className="lg:ml-72">
        <Header />
        <main className="p-4 sm:p-6 bg-background min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}