'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useEnhancedInvoice, useEnhancedInvoices } from '@/hooks/use-enhanced-invoices'
import { UpdateInvoiceData } from '@/types'
import { InvoiceForm } from '@/components/forms/invoice-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export default function EditInvoicePage() {
  const { id: rawId } = useParams()
  const router = useRouter()
  const invoiceId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : ''
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { invoice, loading, error, refetch } = useEnhancedInvoice(invoiceId)
  const { updateInvoice } = useEnhancedInvoices()

  const isValidId = !!invoiceId

  const handleSubmit = async (data: UpdateInvoiceData) => {
    setIsSubmitting(true)
    try {
      const updated = await updateInvoice(invoiceId, data)
      if (updated) {
        router.push(`/dashboard/invoices/${invoiceId}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/invoices/${invoiceId}`)
  }

  // -- UI states --

  if (!isValidId) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-center text-muted-foreground">
          מזהה חשבונית לא תקין
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">טוען נתונים...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-xl mx-auto my-10">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">שגיאה</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button onClick={refetch} variant="outline">נסה שוב</Button>
            <Link href="/dashboard/invoices">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                חזרה
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!invoice) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-muted-foreground">לא נמצאו נתונים</span>
      </div>
    )
  }

  // ✅ Render the form
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href={`/dashboard/invoices/${invoiceId}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            חזרה לחשבונית {invoice.invoiceNumber}
          </Button>
        </Link>
      </div>

      <InvoiceForm
        invoice={invoice}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        title="עריכת חשבונית"
      />
    </div>
  )
}
