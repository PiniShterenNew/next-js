'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerFormSchema, CustomerFormSchema } from '@/lib/validations'
import { Customer, CreateCustomerData, UpdateCustomerData } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, X } from 'lucide-react'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface CustomerFormProps {
  customer?: Customer
  onSubmit: (data: CreateCustomerData | UpdateCustomerData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  title?: string
}

export function CustomerForm({ 
  customer, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  title = customer ? 'Edit Customer' : 'Add New Customer'
}: CustomerFormProps) {
  const { user } = useUser()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    setError,
  } = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
    },
  })

  // Set form values when editing
  useEffect(() => {
    if (customer) {
      setValue('name', customer.name)
      setValue('email', customer.email)
      setValue('phone', customer.phone || '')
      setValue('address', customer.address || '')
      setValue('taxId', customer.taxId || '')
    }
  }, [customer, setValue])

  const handleFormSubmit = async (data: CustomerFormSchema) => {
    try {
      // בדיקה שהמייל לא זהה למייל של המשתמש המחובר
      if (user?.emailAddresses[0]?.emailAddress.toLowerCase() === data.email.toLowerCase()) {
        setError('email', {
          type: 'manual',
          message: 'Cannot use your own email address for a customer'
        })
        return
      }

      // Clean up empty strings to undefined for optional fields
      const cleanData = {
        ...data,
        phone: data.phone?.trim() || undefined,
        address: data.address?.trim() || undefined,
        taxId: data.taxId?.trim() || undefined,
      }
      
      await onSubmit(cleanData)
      
      // Reset form only if creating new customer
      if (!customer) {
        reset()
      }
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="gap-6">
          {/* Name */}
          <div className="form-group">
            <Label htmlFor="name" className="form-label">
              Customer Name *
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter customer name"
              className={errors.name ? 'border-destructive' : ''}
              disabled={isLoading || isSubmitting}
            />
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <Label htmlFor="email" className="form-label">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="customer@example.com"
              className={errors.email ? 'border-destructive' : ''}
              disabled={isLoading || isSubmitting}
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <Label htmlFor="phone" className="form-label">
              Phone Number
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="050-123-4567"
              className={errors.phone ? 'border-destructive' : ''}
              disabled={isLoading || isSubmitting}
            />
            {errors.phone && (
              <p className="form-error">{errors.phone.message}</p>
            )}
          </div>

          {/* Tax ID */}
          <div className="form-group">
            <Label htmlFor="taxId" className="form-label">
              Tax ID / Business Number
            </Label>
            <Input
              id="taxId"
              {...register('taxId')}
              placeholder="123456789"
              className={errors.taxId ? 'border-destructive' : ''}
              disabled={isLoading || isSubmitting}
            />
            {errors.taxId && (
              <p className="form-error">{errors.taxId.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Enter 8-9 digit business registration number
            </p>
          </div>

          {/* Address */}
          <div className="form-group">
            <Label htmlFor="address" className="form-label">
              Address
            </Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter customer address"
              rows={3}
              className={errors.address ? 'border-destructive' : ''}
              disabled={isLoading || isSubmitting}
            />
            {errors.address && (
              <p className="form-error">{errors.address.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="min-w-24"
            >
              {(isLoading || isSubmitting) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {customer ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {customer ? 'Update Customer' : 'Create Customer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}