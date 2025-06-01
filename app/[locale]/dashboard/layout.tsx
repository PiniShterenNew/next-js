import { ReactNode } from 'react'
import { Sidebar } from '@/components/layouts/sidebar'
import { Header } from '@/components/layouts/header'

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
      <div className="lg:ml-72 rtl:mr-72 rtl:ml-0">
        <Header />
        <main className="container-responsive section-spacing">
          {children}
        </main>
      </div>
    </div>
  )
}