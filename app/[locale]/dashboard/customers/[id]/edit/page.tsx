'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomer, useCustomers } from '@/hooks/use-customers'
import { CustomerForm } from '@/components/forms/customer-form'
import { UpdateCustomerData } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const { customer, loading, error } = useCustomer(customerId)
  const { updateCustomer } = useCustomers()

  const handleSubmit = async (data: UpdateCustomerData) => {
    const updatedCustomer = await updateCustomer(customerId, data)
    if (updatedCustomer) {
      router.push(`/dashboard/customers/${customerId}`)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/customers/${customerId}`)
  }

  if (loading) {
    return <EditCustomerSkeleton />
  }

  if (error || !customer) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The customer you are trying to edit does not exist.'}
            </p>
            <Link href="/dashboard/customers">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Customers
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/customers" className="hover:text-foreground transition-colors">
          Customers
        </Link>
        <span>/</span>
        <Link 
          href={`/dashboard/customers/${customerId}`}
          className="hover:text-foreground transition-colors"
        >
          {customer.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">Edit</span>
      </div>

      {/* Back Button */}
      <div>
        <Link href={`/dashboard/customers/${customerId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customer Details
          </Button>
        </Link>
      </div>

      {/* Form */}
      <CustomerForm
        customer={customer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        title={`Edit ${customer.name}`}
      />
    </div>
  )
}

function EditCustomerSkeleton() {
  return (
    <div className="max-w-2xl mx-auto gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <span>/</span>
        <Skeleton className="h-4 w-24" />
        <span>/</span>
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Back Button */}
      <Skeleton className="h-9 w-48" />

      {/* Form Skeleton */}
      <Card>
        <div className="p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          
          <div className="gap-6">
            {/* Name Field */}
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Email Field */}
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Phone Field */}
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Tax ID Field */}
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Address Field */}
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}