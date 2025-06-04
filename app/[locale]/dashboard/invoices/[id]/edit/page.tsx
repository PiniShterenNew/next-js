import { Metadata } from 'next'
import EditInvoicePage from '@/components/invoices/edit-invoice-page'

export const metadata: Metadata = {
  title: 'Edit Invoice',
  description: 'Edit an existing invoice',
}

export default function Page() {
  return <EditInvoicePage />
}
