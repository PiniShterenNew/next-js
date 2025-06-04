'use client'

import { useRouter } from 'next/navigation'
import { CustomerForm } from '@/components/forms/customer-form'
import { useCustomers } from '@/hooks/use-customers'
import { CreateCustomerData } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/use-translation'

export default function NewCustomerPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { createCustomer } = useCustomers()

  const handleSubmit = async (data: CreateCustomerData) => {
    const customer = await createCustomer(data)
    if (customer) {
      router.push('/dashboard/customers')
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/customers')
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/customers" className="hover:text-foreground transition-colors">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('customer.newEdit.back')}
          </Button>
        </Link>
      </div>

      {/* Form */}
      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        title="Add New Customer"
      />
    </div>
  )
}