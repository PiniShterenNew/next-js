'use client'

import { useRouter } from 'next/navigation'
import { CustomerForm } from '@/components/forms/customer-form'
import { useCustomers } from '@/hooks/use-customers'
import { CreateCustomerData } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCustomerPage() {
  const router = useRouter()
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
    <div className="max-w-2xl mx-auto gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/customers" className="hover:text-foreground transition-colors">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
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