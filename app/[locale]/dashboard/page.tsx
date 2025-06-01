import { Metadata } from 'next'
import { DashboardContent } from '@/components/dashboard/dashboard-page'

export const metadata: Metadata = {
  title: 'Dashboard | InvoicePro',
  description: 'View your invoice stats, recent activity, and manage your business.',
}

export default function DashboardPage() {
  return <DashboardContent />
}