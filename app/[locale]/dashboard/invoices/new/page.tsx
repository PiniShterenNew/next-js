'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { InvoiceForm } from '@/components/forms/invoice-form'
import { useEnhancedInvoices as useInvoices } from '@/hooks/use-enhanced-invoices'
import { CreateInvoiceData } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/use-translation'

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { createInvoice } = useInvoices()
  const { t } = useTranslation()

  // Get pre-selected customer from URL params
  const preSelectedCustomerId = searchParams.get('customerId') || undefined

  const handleSubmit = async (data: CreateInvoiceData) => {
    const invoice = await createInvoice(data)
    if (invoice) {
      router.push('/dashboard/invoices')
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/invoices')
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/invoices" className="hover:text-foreground transition-colors">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("invoice.backToInvoices")}
          </Button>
        </Link>
      </div>

      {/* Form */}
      <InvoiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        title={t("invoice.new")}
        preSelectedCustomerId={preSelectedCustomerId}
      />
    </div>
  )
}