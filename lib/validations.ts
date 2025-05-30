import { z } from 'zod'

// Customer validation schemas
export const customerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  
  phone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true
      // Basic phone validation for Israeli numbers
      const phoneRegex = /^[\+]?[0-9\-\s\(\)]{7,15}$/
      return phoneRegex.test(phone)
    }, 'Please enter a valid phone number'),
  
  address: z.string()
    .optional()
    .refine((address) => {
      if (!address) return true
      return address.trim().length <= 500
    }, 'Address must be less than 500 characters'),
  
  taxId: z.string()
    .optional()
    .refine((taxId) => {
      if (!taxId || taxId.trim() === '') return true
      // Israeli business number validation (basic)
      const cleanTaxId = taxId.replace(/\D/g, '')
      return cleanTaxId.length >= 8 && cleanTaxId.length <= 9
    }, 'Please enter a valid tax ID (8-9 digits)')
})

export type CustomerFormSchema = z.infer<typeof customerSchema>

// Invoice validation schemas
export const invoiceItemSchema = z.object({
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  
  quantity: z.number()
    .min(0.01, 'Quantity must be greater than 0')
    .max(999999, 'Quantity is too large'),
  
  unitPrice: z.number()
    .min(0, 'Unit price cannot be negative')
    .max(999999, 'Unit price is too large')
})

export const invoiceSchema = z.object({
  customerId: z.string()
    .min(1, 'Please select a customer'),
  
  dueDate: z.date()
    .min(new Date(), 'Due date cannot be in the past'),
  
  notes: z.string()
    .optional()
    .refine((notes) => {
      if (!notes) return true
      return notes.trim().length <= 1000
    }, 'Notes must be less than 1000 characters'),
  
  discount: z.number()
    .min(0, 'Discount cannot be negative')
    .max(999999, 'Discount is too large')
    .optional()
    .default(0),
  
  items: z.array(invoiceItemSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Maximum 50 items per invoice')
})

export type InvoiceFormSchema = z.infer<typeof invoiceSchema>
export type InvoiceItemFormSchema = z.infer<typeof invoiceItemSchema>

// Form validation for client-side
export const customerFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z.string()
    .optional(),
  
  address: z.string()
    .optional(),
  
  taxId: z.string()
    .optional()
})

export const invoiceFormSchema = z.object({
  customerId: z.string()
    .min(1, 'Please select a customer'),
  
  dueDate: z.string()
    .min(1, 'Please select a due date'),
  
  notes: z.string()
    .optional(),
  
  discount: z.string()
    .optional()
    .default('0'),
  
  items: z.array(z.object({
    description: z.string()
      .min(1, 'Description is required'),
    quantity: z.string()
      .min(1, 'Quantity is required'),
    unitPrice: z.string()
      .min(1, 'Unit price is required')
  }))
  .min(1, 'At least one item is required')
})

// Settings validation schema
export const userSettingsSchema = z.object({
  businessName: z.string()
    .optional(),
  
  businessAddress: z.string()
    .optional(),
  
  businessPhone: z.string()
    .optional(),
  
  businessEmail: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  
  taxRate: z.number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .default(17),
  
  currency: z.string()
    .min(3, 'Currency code must be 3 characters')
    .max(3, 'Currency code must be 3 characters')
    .default('ILS'),
  
  invoicePrefix: z.string()
    .min(1, 'Invoice prefix is required')
    .max(10, 'Invoice prefix must be less than 10 characters')
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