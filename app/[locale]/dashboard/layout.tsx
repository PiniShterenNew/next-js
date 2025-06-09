import { ReactNode } from 'react'
import { Sidebar } from '@/components/layouts/sidebar'
import { Header } from '@/components/layouts/header'
import { GlobalAppProvider } from '@/context/AppContext'
import { UserProvider } from '@/components/providers/user-provider'
import { SocketProvider } from '@/context/SocketContext'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <UserProvider>
        <GlobalAppProvider>
          <SocketProvider>
          <div className="min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content with margin for desktop sidebar */}
            <div className="m-0 lg:ml-72 lg:rtl:mr-72 lg:rtl:ml-0">
              <Header />
              <main className="container-responsive section-spacing py-5">
                {children}
              </main>
            </div>
          </div>
          </SocketProvider>
        </GlobalAppProvider>
    </UserProvider>
  )
}