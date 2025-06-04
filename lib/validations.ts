// lib/validations.ts - וולידציה מאוחדת לשרת ולקוח

import { z } from 'zod'

// Customer validation schemas - גרסה מאוחדת לשרת ולקוח
export const customerSchema = z.object({
  name: z.string()
    .min(2, 'validation.customer.name.min')
    .max(100, 'validation.customer.name.max')
    .trim(),
  
  email: z.string()
    .email('validation.customer.email.invalid')
    .max(255, 'validation.customer.email.max')
    .toLowerCase()
    .trim(),
  
  phone: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val) // המר מחרוזת ריקה ל-undefined
    .refine((phone) => {
      if (!phone) return true // אם undefined או null - בסדר
      // Basic phone validation for Israeli numbers
      const phoneRegex = /^[\+]?[0-9\-\s\(\)]{7,15}$/
      return phoneRegex.test(phone)
    }, 'validation.customer.phone.invalid'),
  
  address: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val) // המר מחרוזת ריקה ל-undefined
    .refine((address) => {
      if (!address) return true
      return address.trim().length <= 500
    }, 'validation.customer.address.max'),
  
  taxId: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val) // המר מחרוזת ריקה ל-undefined
    .refine((taxId) => {
      if (!taxId) return true // אם undefined או null - בסדר
      // Israeli business number validation (basic)
      const cleanTaxId = taxId.replace(/\D/g, '')
      return cleanTaxId.length >= 8 && cleanTaxId.length <= 9
    }, 'validation.customer.taxId.invalid')
})

export type CustomerFormSchema = z.infer<typeof customerSchema>

// 👇 עכשיו customerFormSchema זהה ל-customerSchema - אותה וולידציה בדיוק!
export const customerFormSchema = customerSchema

// Invoice validation schemas
export const invoiceItemSchema = z.object({
  description: z.string()
    .min(1, 'validation.invoiceItem.description.required')
    .max(500, 'validation.invoiceItem.description.max')
    .trim(),
  
  quantity: z.number()
    .min(0.01, 'validation.invoiceItem.quantity.min')
    .max(999999, 'validation.invoiceItem.quantity.max'),
  
  unitPrice: z.number()
    .min(0, 'validation.invoiceItem.unitPrice.negative')
    .max(999999, 'validation.invoiceItem.unitPrice.max')
})

// ✅ Schema לחשבונית חדשה (עם בדיקת תאריך עתידי)
export const invoiceSchema = z.object({
  customerId: z.string()
    .min(1, 'validation.invoice.customerId.required'),
  
  dueDate: z.date()
    .min(new Date(), 'validation.invoice.dueDate.pastDate'),
  
  notes: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val) // תיקון גם כאן
    .refine((notes) => {
      if (!notes) return true
      return notes.trim().length <= 1000
    }, 'validation.invoice.notes.max'),
  
  discount: z.number()
    .min(0, 'validation.invoice.discount.negative')
    .max(999999, 'validation.invoice.discount.tooLarge')
    .optional()
    .default(0),
  
  items: z.array(invoiceItemSchema)
    .min(1, 'validation.invoice.items.min')
    .max(50, 'validation.invoice.items.max')
})

// ✅ Schema נפרד לעדכון חשבונית (ללא בדיקת תאריך עתידי)
export const updateInvoiceSchema = z.object({
  customerId: z.string()
    .min(1, 'validation.invoice.customerId.required'),
  
  dueDate: z.date(),
  
  notes: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val) // תיקון גם כאן
    .refine((notes) => {
      if (!notes) return true
      return notes.trim().length <= 1000
    }, 'validation.invoice.notes.max'),
  
  discount: z.number()
    .min(0, 'validation.invoice.discount.negative')
    .max(999999, 'validation.invoice.discount.tooLarge')
    .optional()
    .default(0),
  
  items: z.array(invoiceItemSchema)
    .min(1, 'validation.invoice.items.min')
    .max(50, 'validation.invoice.items.max')
})

export type InvoiceFormSchema = z.infer<typeof invoiceSchema>
export type UpdateInvoiceFormSchema = z.infer<typeof updateInvoiceSchema>
export type InvoiceItemFormSchema = z.infer<typeof invoiceItemSchema>

// Invoice form schema לטפסים (עם string inputs)
export const invoiceFormSchema = z.object({
  customerId: z.string()
    .min(1, 'validation.invoice.customerId.required'),
  
  dueDate: z.string()
    .min(1, 'validation.invoice.dueDate.required'),
  
  notes: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val), // תיקון גם כאן
  
  discount: z.string()
    .optional()
    .default('0')
    .transform((val) => val === '' ? '0' : val), // תיקון - מחרוזת ריקה הופכת ל-"0"
  
  items: z.array(z.object({
    description: z.string()
      .min(1, 'validation.invoiceItem.description.required')
      .transform((val) => val.trim()), // נקה רווחים
    quantity: z.string()
      .min(1, 'validation.invoiceItem.quantity.required'),
    unitPrice: z.string()
      .min(1, 'validation.invoiceItem.unitPrice.required')
  }))
  .min(1, 'validation.invoice.items.min')
})

// Settings validation schema
export const userSettingsSchema = z.object({
  businessName: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val), // תיקון גם כאן
  
  businessAddress: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val), // תיקון גם כאן
  
  businessPhone: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val), // תיקון גם כאן
  
  businessEmail: z.string()
    .optional()
    .transform((val) => val === '' ? undefined : val) // תיקון גם כאן
    .refine((email) => {
      if (!email) return true
      return z.string().email().safeParse(email).success
    }, 'validation.settings.businessEmail.invalid'),
  
  taxRate: z.number()
    .min(0, 'validation.settings.taxRate.negative')
    .max(100, 'validation.settings.taxRate.max')
    .default(17),
  
  currency: z.string()
    .min(3, 'validation.settings.currency.length')
    .max(3, 'validation.settings.currency.length')
    .default('ILS'),
  
  invoicePrefix: z.string()
    .min(1, 'validation.settings.invoicePrefix.required')
    .max(10, 'validation.settings.invoicePrefix.max')
    .default('INV'),
})

export type UserSettingsFormSchema = z.infer<typeof userSettingsSchema>

// Search and filter schemas
export const customerFiltersSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
})

export const invoiceFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])).optional(),
  customerId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
})