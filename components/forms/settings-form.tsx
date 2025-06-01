'use client'

import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSettingsSchema, UserSettingsFormSchema } from '@/lib/validations'
import { UserSettings, UpdateUserSettingsData } from '@/types'
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
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, Building, CreditCard, Globe, Calculator } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface SettingsFormProps {
  settings?: UserSettings
  onSubmit: (data: UpdateUserSettingsData) => Promise<void>
  isLoading?: boolean
}

export function SettingsForm({ 
  settings, 
  onSubmit, 
  isLoading = false
}: SettingsFormProps) {
  const [enableTax, setEnableTax] = useState(true)
  const t = useTranslations('settings.form')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UserSettingsFormSchema>({
    resolver: zodResolver(userSettingsSchema) as any,
    defaultValues: {
      businessName: '',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      taxRate: 17,
      currency: 'ILS',
      invoicePrefix: 'INV',
    },
  })

  const watchedTaxRate = watch('taxRate')

  // Set form values when settings are loaded
  useEffect(() => {
    if (settings) {
      setValue('businessName', settings.businessName || '')
      setValue('businessAddress', settings.businessAddress || '')
      setValue('businessPhone', settings.businessPhone || '')
      setValue('businessEmail', settings.businessEmail || '')
      setValue('taxRate', Number(settings.taxRate))
      setValue('currency', settings.currency)
      setValue('invoicePrefix', settings.invoicePrefix)
      
      setEnableTax(Number(settings.taxRate) > 0)
    }
  }, [settings, setValue])

  const handleFormSubmit: SubmitHandler<UserSettingsFormSchema> = async (data) => {
    try {
      const submitData: UpdateUserSettingsData = {
        ...data,
        taxRate: enableTax ? data.taxRate : 0,
        currency: data.currency || 'ILS',
        invoicePrefix: data.invoicePrefix || 'INV',
        businessEmail: data.businessEmail?.trim() || undefined,
        businessAddress: data.businessAddress?.trim() || undefined,
        businessPhone: data.businessPhone?.trim() || undefined,
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleTaxToggle = (enabled: boolean) => {
    setEnableTax(enabled)
    if (!enabled) {
      setValue('taxRate', 0)
    } else if (watchedTaxRate === 0) {
      setValue('taxRate', 17) // Default VAT
    }
  }

  return (
    <div className="gap-6">
      <form onSubmit={handleSubmit(handleFormSubmit as any)} className="gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              <span>{t('business.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            {/* Business Name */}
            <div className="form-group">
              <Label htmlFor="businessName" className="form-label">
                {t('business.name')}
              </Label>
              <Input
                id="businessName"
                {...register('businessName')}
                placeholder={t('business.namePlaceholder')}
                className={errors.businessName ? 'border-destructive' : ''}
                disabled={isLoading || isSubmitting}
              />
              {errors.businessName && (
                <p className="form-error">{errors.businessName.message}</p>
              )}
            </div>

            {/* Business Email */}
            <div className="form-group">
              <Label htmlFor="businessEmail" className="form-label">
                {t('business.email')}
              </Label>
              <Input
                id="businessEmail"
                type="email"
                {...register('businessEmail')}
                placeholder={t('business.emailPlaceholder')}
                className={errors.businessEmail ? 'border-destructive' : ''}
                disabled={isLoading || isSubmitting}
              />
              {errors.businessEmail && (
                <p className="form-error">{errors.businessEmail.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {t('business.emailHelp')}
              </p>
            </div>

            {/* Business Phone */}
            <div className="form-group">
              <Label htmlFor="businessPhone" className="form-label">
                {t('business.phone')}
              </Label>
              <Input
                id="businessPhone"
                {...register('businessPhone')}
                placeholder={t('business.phonePlaceholder')}
                className={errors.businessPhone ? 'border-destructive' : ''}
                disabled={isLoading || isSubmitting}
              />
              {errors.businessPhone && (
                <p className="form-error">{errors.businessPhone.message}</p>
              )}
            </div>

            {/* Business Address */}
            <div className="form-group">
              <Label htmlFor="businessAddress" className="form-label">
                {t('business.address')}
              </Label>
              <Textarea
                id="businessAddress"
                {...register('businessAddress')}
                placeholder={t('business.addressPlaceholder')}
                rows={3}
                className={errors.businessAddress ? 'border-destructive' : ''}
                disabled={isLoading || isSubmitting}
              />
              {errors.businessAddress && (
                <p className="form-error">{errors.businessAddress.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span>{t('billing.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Currency */}
              <div className="form-group">
                <Label htmlFor="currency" className="form-label">
                  {t('billing.currency')}
                </Label>
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                  disabled={isLoading || isSubmitting}
                >
                  <SelectTrigger className={errors.currency ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ILS">₪ {t('billing.currencyILS')}</SelectItem>
                    <SelectItem value="USD">$ {t('billing.currencyUSD')}</SelectItem>
                    <SelectItem value="EUR">€ {t('billing.currencyEUR')}</SelectItem>
                    <SelectItem value="GBP">£ {t('billing.currencyGBP')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="form-error">{errors.currency.message}</p>
                )}
              </div>

              {/* Invoice Prefix */}
              <div className="form-group">
                <Label htmlFor="invoicePrefix" className="form-label">
                  {t('billing.prefix')}
                </Label>
                <Input
                  id="invoicePrefix"
                  {...register('invoicePrefix')}
                  placeholder={t('billing.prefixPlaceholder')}
                  className={errors.invoicePrefix ? 'border-destructive' : ''}
                  disabled={isLoading || isSubmitting}
                />
                {errors.invoicePrefix && (
                  <p className="form-error">{errors.invoicePrefix.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {t('billing.prefixHelp')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span>{t('tax.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            {/* Enable Tax Toggle */}
            <div className="flex items-center justify-between">
              <div className="gap-0.5">
                <Label className="text-base">{t('tax.enable')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('tax.enableDescription')}
                </p>
              </div>
              <Switch
                checked={enableTax}
                onCheckedChange={handleTaxToggle}
                disabled={isLoading || isSubmitting}
              />
            </div>

            {/* Tax Rate */}
            {enableTax && (
              <div className="form-group">
                <Label htmlFor="taxRate" className="form-label">
                  {t('tax.rate')}
                </Label>
                <div className="relative">
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register('taxRate', { valueAsNumber: true })}
                    placeholder={t('tax.ratePlaceholder')}
                    className={errors.taxRate ? 'border-destructive' : ''}
                    disabled={isLoading || isSubmitting}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                {errors.taxRate && (
                  <p className="form-error">{errors.taxRate.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {t('tax.rateHelp')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="min-w-32"
          >
            {(isLoading || isSubmitting) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('save')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}