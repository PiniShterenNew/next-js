'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoiceFormSchema } from '@/lib/validations'
import { Invoice, CreateInvoiceData, UpdateInvoiceData, Customer } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, X, Plus, Trash2, Calculator } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useCustomers } from '@/hooks/use-customers'
import { formatCurrency, parseNumber, calculateInvoiceTotal } from '@/lib/utils'
import { format } from 'date-fns'

interface InvoiceFormData {
  customerId: string
  dueDate: string
  notes: string
  discount: string
  items: {
    description: string
    quantity: string
    unitPrice: string
  }[]
}

interface InvoiceFormProps {
  invoice?: Invoice
  onSubmit: (data: CreateInvoiceData | UpdateInvoiceData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  title?: string
  preSelectedCustomerId?: string
}

export function InvoiceForm({ 
  invoice, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  title = invoice ? 'Edit Invoice' : 'Create New Invoice',
  preSelectedCustomerId
}: InvoiceFormProps) {
  const [taxRate] = useState() // Default Israeli VAT rate
  const { customers } = useCustomers({ limit: 100 }) // Get all customers for dropdown

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    control,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: preSelectedCustomerId || '',
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
      notes: '',
      discount: '0',
      items: [{ description: '', quantity: '1', unitPrice: '0' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  // Watch form values for calculations
  const watchedItems = watch('items')
  const watchedDiscount = watch('discount')

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = watchedItems.reduce((sum, item) => {
      const quantity = parseNumber(item.quantity || '0')
      const unitPrice = parseNumber(item.unitPrice || '0')
      return sum + (quantity * unitPrice)
    }, 0)

    const discount = parseNumber(watchedDiscount || '0')
    
    return calculateInvoiceTotal(subtotal, taxRate, discount)
  }, [watchedItems, watchedDiscount, taxRate])

  // Set form values when editing
  useEffect(() => {
    if (invoice) {
      setValue('customerId', invoice.customerId)
      setValue('dueDate', format(new Date(invoice.dueDate), 'yyyy-MM-dd'))
      setValue('notes', invoice.notes || '')
      setValue('discount', invoice.discount.toString())
      
      // Set items
      const formattedItems = invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
      }))
      
      // Clear existing items and set new ones
      while (fields.length > 0) {
        remove(0)
      }
      formattedItems.forEach(item => append(item))
    }
  }, [invoice, setValue, fields.length, remove, append])

  const handleFormSubmit = async (data: InvoiceFormData) => {
    try {
      const submitData = {
        customerId: data.customerId,
        dueDate: new Date(data.dueDate),
        notes: data.notes.trim() || undefined,
        discount: parseNumber(data.discount),
        items: data.items.map(item => ({
          description: item.description.trim(),
          quantity: parseNumber(item.quantity),
          unitPrice: parseNumber(item.unitPrice),
        })).filter(item => item.description && item.quantity > 0 && item.unitPrice >= 0)
      }
      
      await onSubmit(submitData)
      
      // Reset form only if creating new invoice
      if (!invoice) {
        reset()
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const addItem = () => {
    append({ description: '', quantity: '1', unitPrice: '0' })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            {invoice && (
              <Badge variant="secondary">
                {invoice.invoiceNumber}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Customer and Due Date */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Customer Selection */}
              <div className="form-group">
                <Label htmlFor="customerId" className="form-label">
                  Customer *
                </Label>
                <Select
                  value={watch('customerId')}
                  onValueChange={(value) => setValue('customerId', value)}
                  disabled={isLoading || isSubmitting}
                >
                  <SelectTrigger className={errors.customerId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="form-error">{errors.customerId.message}</p>
                )}
              </div>

              {/* Due Date */}
              <div className="form-group">
                <Label htmlFor="dueDate" className="form-label">
                  Due Date *
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                  className={errors.dueDate ? 'border-destructive' : ''}
                  disabled={isLoading || isSubmitting}
                />
                {errors.dueDate && (
                  <p className="form-error">{errors.dueDate.message}</p>
                )}
              </div>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Invoice Items *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={isLoading || isSubmitting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid gap-4 md:grid-cols-12 items-start">
                      {/* Description */}
                      <div className="md:col-span-5">
                        <Label className="text-sm">Description</Label>
                        <Input
                          {...register(`items.${index}.description`)}
                          placeholder="Item description"
                          disabled={isLoading || isSubmitting}
                          className={errors.items?.[index]?.description ? 'border-destructive' : ''}
                        />
                        {errors.items?.[index]?.description && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2">
                        <Label className="text-sm">Quantity</Label>
                        <Input
                          {...register(`items.${index}.quantity`)}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="1"
                          disabled={isLoading || isSubmitting}
                          className={errors.items?.[index]?.quantity ? 'border-destructive' : ''}
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.items[index]?.quantity?.message}
                          </p>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-2">
                        <Label className="text-sm">Unit Price</Label>
                        <Input
                          {...register(`items.${index}.unitPrice`)}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          disabled={isLoading || isSubmitting}
                          className={errors.items?.[index]?.unitPrice ? 'border-destructive' : ''}
                        />
                        {errors.items?.[index]?.unitPrice && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.items[index]?.unitPrice?.message}
                          </p>
                        )}
                      </div>

                      {/* Total */}
                      <div className="md:col-span-2">
                        <Label className="text-sm">Total</Label>
                        <div className="h-10 px-3 py-2 bg-muted rounded-md text-sm flex items-center">
                          {formatCurrency(
                            parseNumber(watchedItems[index]?.quantity || '0') * 
                            parseNumber(watchedItems[index]?.unitPrice || '0')
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={fields.length <= 1 || isLoading || isSubmitting}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {errors.items && (
                <p className="form-error">{errors.items.message}</p>
              )}
            </div>

            {/* Discount and Notes */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Discount */}
              <div className="form-group">
                <Label htmlFor="discount" className="form-label">
                  Discount Amount
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('discount')}
                  placeholder="0.00"
                  disabled={isLoading || isSubmitting}
                  className={errors.discount ? 'border-destructive' : ''}
                />
                {errors.discount && (
                  <p className="form-error">{errors.discount.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="form-group">
                <Label htmlFor="notes" className="form-label">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Additional notes or payment terms"
                  rows={3}
                  disabled={isLoading || isSubmitting}
                  className={errors.notes ? 'border-destructive' : ''}
                />
                {errors.notes && (
                  <p className="form-error">{errors.notes.message}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Calculations Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Calculator className="w-4 h-4 mr-2" />
                <span className="font-semibold">Invoice Summary</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculations.subtotal)}</span>
                </div>
                {calculations.discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount:</span>
                    <span>-{formatCurrency(calculations.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  {taxRate && <span>Tax ({taxRate}%):</span>}
                  <span>{formatCurrency(calculations.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total:</span>
                  <span>{formatCurrency(calculations.total)}</span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
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
                className="min-w-32"
              >
                {(isLoading || isSubmitting) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {invoice ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {invoice ? 'Update Invoice' : 'Create Invoice'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}