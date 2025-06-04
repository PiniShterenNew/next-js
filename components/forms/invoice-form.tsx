// components/forms/invoice-form.tsx - רכיב מתוקן עם טעינת נתונים נכונה
'use client'

import { useFieldArray, useWatch } from 'react-hook-form'
import { invoiceFormSchema } from '@/lib/validations'
import { Invoice, CreateInvoiceData, UpdateInvoiceData } from '@/types'
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
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useCustomers } from '@/hooks/use-customers'
import { useSettings } from '@/hooks/use-settings'
import { formatCurrency, parseNumber, calculateInvoiceTotal } from '@/lib/utils'
import { format } from 'date-fns'
import { useTranslation } from '@/hooks/use-translation'
import { useTranslatedForm } from '@/hooks/use-translated-form'

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
  title = "",
  preSelectedCustomerId
}: InvoiceFormProps) {
  // ✅ 1. טעינת dependencies
  const { settings, loading: settingsLoading } = useSettings()
  const { customers } = useCustomers({ limit: 100 })
  const { t } = useTranslation()

  // ✅ 2. State למעקב אחר מוכנות הטופס
  const [isFormReady, setIsFormReady] = useState(false)

  // ✅ 3. פונקציה לחישוב ערכי ברירת מחדל דינמיים
  const getDefaultValues = useCallback((): InvoiceFormData => {
    if (invoice) {
      // מצב עריכה - השתמש בנתוני החשבונית הקיימת
      return {
        customerId: invoice.customerId || '',
        dueDate: format(new Date(invoice.dueDate), 'yyyy-MM-dd'),
        notes: invoice.notes || '',
        discount: invoice.discount?.toString() || '0',
        items: invoice.items?.length > 0 ? invoice.items.map(item => ({
          description: item.description || '',
          quantity: item.quantity?.toString() || '1',
          unitPrice: item.unitPrice?.toString() || '0',
        })) : [{ description: '', quantity: '1', unitPrice: '0' }]
      }
    } else {
      // מצב יצירה חדשה - ערכי ברירת מחדל
      return {
        customerId: preSelectedCustomerId || '',
        dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        notes: '',
        discount: '0',
        items: [{ description: '', quantity: '1', unitPrice: '0' }],
      }
    }
  }, [invoice, preSelectedCustomerId])

  // ✅ 4. אתחול הטופס עם ערכי ברירת מחדל דינמיים
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    control,
  } = useTranslatedForm(invoiceFormSchema, {
    defaultValues: getDefaultValues(),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  // ✅ 5. Reset הטופס כשהחשבונית משתנה
  useEffect(() => {
    if (invoice) {
      // יש חשבונית - עריכה
      const formData = getDefaultValues()
      reset(formData)
      setIsFormReady(true)
    } else if (!invoice && !isLoading) {
      // אין חשבונית ולא בטעינה - יצירה חדשה
      const formData = getDefaultValues()
      reset(formData)
      setIsFormReady(true)
    }
  }, [invoice, reset, getDefaultValues, isLoading])

  // ✅ 6. וידוא שהטופס מוכן לטפסים חדשים
  useEffect(() => {
    if (!invoice && !preSelectedCustomerId && !isLoading) {
      setIsFormReady(true)
    }
  }, [invoice, preSelectedCustomerId, isLoading])

  // ✅ 7. Watch form values לחישובים (עם safe access)
  const watchedItems = useWatch({ control, name: 'items' })
  const watchedDiscount = useWatch({ control, name: 'discount' })

  // ✅ 8. חישוב סיכומים עם הגנה מפני undefined
  const calculations = useMemo(() => {
    if (!settings) return { subtotal: 0, tax: 0, discount: 0, total: 0 }

    const subtotal = watchedItems?.reduce((sum, item) => {
      if (!item) return sum
      const quantity = parseNumber(item.quantity || '0')
      const unitPrice = parseNumber(item.unitPrice || '0')
      return sum + (quantity * unitPrice)
    }, 0) || 0

    const discount = parseNumber(watchedDiscount || '0')
    const taxRate = Number(settings.taxRate) || 0
    return calculateInvoiceTotal(subtotal, taxRate, discount)
  }, [watchedItems, watchedDiscount, settings])

  // ✅ 9. טיפול בשליחת הטופס
  const handleFormSubmit = async (data: InvoiceFormData) => {
    try {
      const submitData = {
        customerId: data.customerId,
        dueDate: new Date(data.dueDate),
        notes: data.notes?.trim() || undefined,
        discount: parseNumber(data.discount || '0'),
        items: data.items
          ?.map(item => ({
            description: item.description?.trim() || '',
            quantity: parseNumber(item.quantity || '0'),
            unitPrice: parseNumber(item.unitPrice || '0'),
          }))
          .filter(item => item.description && item.quantity > 0 && item.unitPrice >= 0) || []
      }

      await onSubmit(submitData)

      // אם זה טופס חדש, נקה אותו
      if (!invoice) {
        const newFormData = getDefaultValues()
        reset(newFormData)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // ✅ 10. פונקציות עזר
  const addItem = () => {
    append({ description: '', quantity: '1', unitPrice: '0' })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  // ✅ 11. Loading states - הצגת טעינה עד שהטופס מוכן
  if (settingsLoading || !isFormReady) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>
              {settingsLoading
                ? t("invoice.loading")
                : invoice
                  ? 'טוען נתוני החשבונית...'
                  : 'מכין טופס חדש...'
              }
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ✅ 12. רינדור הטופס עם key ייחודי
  return (
    <div>
      <Card key={invoice?.id || 'new-invoice'}> {/* Key ייחודי לכל חשבונית */}
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {invoice ? t("invoice.edit") : title}
            {invoice && (
              <Badge variant="secondary">
                {invoice.invoiceNumber}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">

            {/* ✅ Customer and Due Date Section */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* Customer Selection */}
              <div className="form-group">
                <Label htmlFor="customerId" className="form-label">
                  {t("invoice.customer")} *
                </Label>
                <Select
                  value={watch('customerId') || ''}
                  onValueChange={(value) => setValue('customerId', value)}
                  disabled={isLoading || isSubmitting}
                >
                  <SelectTrigger className={errors.customerId ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t("invoice.customerPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
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
                  {t("invoice.dueDate")} *
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

            <Separator />

            {/* ✅ Invoice Items Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{t("invoice.items")} *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={isLoading || isSubmitting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("invoice.addItem")}
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid gap-4 md:grid-cols-12 items-end">

                      {/* Description */}
                      <div className="md:col-span-5">
                        <Label className="text-sm">{t("invoice.itemDescription")}</Label>
                        <Input
                          {...register(`items.${index}.description`)}
                          placeholder={t("invoice.itemDescription")}
                          disabled={isLoading || isSubmitting}
                          className={errors.items?.[index]?.description ? 'border-destructive' : ''}
                        />
                        {errors.items?.[index]?.description && (
                          <p className="form-error">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2">
                        <Label className="text-sm">{t("invoice.itemQuantity")}</Label>
                        <Input
                          {...register(`items.${index}.quantity`)}
                          type="number"
                          min="0"
                          step="1"
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
                        <Label className="text-sm">{t("invoice.itemUnitPrice")}</Label>
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
                        <Label className="text-sm">{t("invoice.itemTotal")}</Label>
                        <div className="h-10 px-3 py-2 bg-muted rounded-md text-sm flex items-center">
                          {formatCurrency(
                            parseNumber(watchedItems?.[index]?.quantity || '0') *
                            parseNumber(watchedItems?.[index]?.unitPrice || '0')
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

            {/* ✅ Discount and Notes Section */}
            <div className="grid gap-6 md:grid-cols-1">

              {/* Discount */}
              <div className="form-group">
                <Label htmlFor="discount" className="form-label">
                  {t("invoice.discount")}
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
                  {t("invoice.notes")}
                </Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder={t("invoice.notesPlaceholder")}
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

            {/* ✅ Calculations Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Calculator className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                <span className="font-semibold">סיכום החשבונית</span>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span>סכום ביניים:</span>
                  <span>{formatCurrency(calculations.subtotal)}</span>
                </div>
                {calculations.discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>הנחה:</span>
                    <span>-{formatCurrency(calculations.discount)}</span>
                  </div>
                )}
                {Number(settings?.taxRate || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>מס ({settings?.taxRate || 0}%):</span>
                    <span>{formatCurrency(calculations.tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>סך הכל:</span>
                  <span>{formatCurrency(calculations.total)}</span>
                </div>
              </div>
            </div>

            {/* ✅ Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isLoading || isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  ביטול
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
                    {invoice ? 'מעדכן...' : 'יוצר...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {invoice ? 'עדכן חשבונית' : 'צור חשבונית'}
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