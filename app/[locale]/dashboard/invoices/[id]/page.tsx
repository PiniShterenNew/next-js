import InvoiceDetailPage from "@/components/invoices/invoice-view"

interface InvoicePageProps {
  params: {
    id: string
  }
}

export default function InvoicePage() {
  return <InvoiceDetailPage  />
}

export async function generateMetadata({ params }: InvoicePageProps) {
  return {
    title: `Invoice ${params.id} - Dashboard`,
    description: `View invoice details for invoice ${params.id}`,
  }
}