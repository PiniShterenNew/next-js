import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: Date | string, formatString: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatString)
}

export function formatCurrency(amount: number, currency: string = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Invoice status utilities
export function getInvoiceStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'sent':
    case 'pending':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    case 'draft':
      return '!bg-gray-500 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    case 'cancelled':
      return '!bg-gray-500 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    default:
      return '!bg-gray-500 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  }
}

export function getInvoiceStatusText(status: string): string {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'Draft'
    case 'sent':
      return 'Sent'
    case 'paid':
      return 'Paid'
    case 'overdue':
      return 'Overdue'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

// Form validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Basic Israeli phone number validation
  const phoneRegex = /^[\+]?[0-9\-\s\(\)]{7,15}$/
  return phoneRegex.test(phone)
}

// Number utilities
export function parseNumber(value: string): number {
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''))
  return isNaN(parsed) ? 0 : parsed
}

export function calculateInvoiceTotal(
  subtotal: number, 
  taxRate: number = 0, 
  discount: number = 0
): {
  subtotal: number
  tax: number
  discount: number
  total: number
} {
  const discountAmount = discount
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount

  return {
    subtotal,
    tax: taxAmount,
    discount: discountAmount,
    total,
  }
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateInvoiceNumber(prefix: string, number: number): string {
  return `${prefix}-${number.toString().padStart(4, '0')}`
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

// Debounce utility for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}