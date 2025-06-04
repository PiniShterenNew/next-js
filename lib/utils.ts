import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns'
import {
  CheckCircle,
  Send,
  Clock,
  AlertTriangle,
  FileText,
  X,
  HelpCircle
} from 'lucide-react';

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
// Invoice status utilities - FIXED VERSION
interface StatusConfig {
  color: string;
  icon: typeof CheckCircle;
  translationKey: string;
}

export const INVOICE_STATUS_CONFIG: Record<string, StatusConfig> = {
  // Match your enum values exactly
  PAID: {
    color: 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    icon: CheckCircle,
    translationKey: 'invoices.status.paid'
  },

  SENT: {
    color: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    icon: Send,
    translationKey: 'invoices.status.sent'
  },

  PENDING: {
    color: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    icon: Clock,
    translationKey: 'invoices.status.pending'
  },

  OVERDUE: {
    color: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
    icon: AlertTriangle,
    translationKey: 'invoices.status.overdue'
  },

  DRAFT: {
    color: 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
    icon: FileText,
    translationKey: 'invoices.status.draft'
  },

  CANCELLED: {
    color: 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    icon: X,
    translationKey: 'invoices.status.cancelled'
  },

  // Keep lowercase versions for backward compatibility
  paid: {
    color: 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    icon: CheckCircle,
    translationKey: 'invoices.status.paid'
  },

  sent: {
    color: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    icon: Send,
    translationKey: 'invoices.status.sent'
  },

  pending: {
    color: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    icon: Clock,
    translationKey: 'invoices.status.pending'
  },

  overdue: {
    color: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
    icon: AlertTriangle,
    translationKey: 'invoices.status.overdue'
  },

  draft: {
    color: 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
    icon: FileText,
    translationKey: 'invoices.status.draft'
  },

  cancelled: {
    color: 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    icon: X,
    translationKey: 'invoices.status.cancelled'
  },

  // Default fallback
  default: {
    color: 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    icon: HelpCircle,
    translationKey: 'invoices.status.unknown'
  }
};

// === Helper Function ===
export function getStatusConfig(status: string): StatusConfig {
  return INVOICE_STATUS_CONFIG[status] || INVOICE_STATUS_CONFIG.default;
}

// === Legacy Functions (for backward compatibility) ===
export function getInvoiceStatusColor(status: string): string {
  return getStatusConfig(status).color;
}

export function getInvoiceStatusTranslationKey(status: string): string {
  return getStatusConfig(status).translationKey;
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