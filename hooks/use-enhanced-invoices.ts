// hooks/use-enhanced-invoices.ts - Enhanced hooks עם Cache
'use client'

import { useState, useCallback } from 'react'
import { Invoice, ApiResponse, PaginatedResponse, CreateInvoiceData, UpdateInvoiceData, InvoiceStatus } from '@/types'
import { toast } from 'sonner'
import { appCache, CACHE_KEYS, CACHE_TTL, cacheUtils, useCachedFetch } from '@/lib/cache'

interface UseInvoicesOptions {
  search?: string
  status?: string
  customerId?: string
  page?: number
  limit?: number
}

interface UseInvoicesReturn {
  invoices: Invoice[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  // Actions
  fetchInvoices: (useCache?: boolean) => Promise<Invoice[]>
  createInvoice: (data: CreateInvoiceData) => Promise<Invoice | null>
  updateInvoice: (id: string, data: UpdateInvoiceData) => Promise<Invoice | null>
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<Invoice | null>
  deleteInvoice: (id: string) => Promise<boolean>
  refreshInvoices: () => Promise<Invoice[]>
}

export function useEnhancedInvoices({
  search = '',
  status = 'all',
  customerId = '',
  page = 1,
  limit = 10
}: UseInvoicesOptions = {}): UseInvoicesReturn {
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  // יצירת cache key ייחודי לפי הפרמטרים
  const cacheKey = CACHE_KEYS.INVOICES({ search, status, customerId, page, limit })

  // Fetcher function
  const fetcher = useCallback(async (): Promise<Invoice[]> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && status !== 'all' && { status }),
      ...(customerId && { customerId })
    })

    const response = await fetch(`/api/invoices?${params}`)
    const data: PaginatedResponse<Invoice> = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch invoices')
    }

    if (data.success) {
      setPagination(data.pagination)
      return data.data || []
    } else {
      throw new Error(data.error || 'Failed to fetch invoices')
    }
  }, [search, status, customerId, page, limit])

  // שימוש ב-cached fetch
  const {
    data: invoices,
    loading,
    error,
    refetch,
    fetchCached
  } = useCachedFetch(
    cacheKey,
    fetcher,
    CACHE_TTL.BUSINESS_DATA,
    [search, status, customerId, page, limit]
  )

  // Create invoice
  const createInvoice = async (data: CreateInvoiceData): Promise<Invoice | null> => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<Invoice> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create invoice')
      }

      if (result.success && result.data) {
        toast.success('Invoice created successfully!')
        
        // מחק cache של חשבוניות והסטטיסטיקות
        cacheUtils.invalidateInvoices()
        
        // רענן נתונים
        await refetch()
        
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create invoice')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to create invoice', {
        description: errorMessage
      })
      return null
    }
  }

  // Update invoice
  const updateInvoice = async (id: string, data: UpdateInvoiceData): Promise<Invoice | null> => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<Invoice> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update invoice')
      }

      if (result.success && result.data) {
        toast.success('Invoice updated successfully!')
        
        // מחק cache של החשבונית הספציפית וכל החשבוניות
        appCache.delete(CACHE_KEYS.INVOICE(id))
        cacheUtils.invalidateInvoices()
        
        // רענן נתונים
        await refetch()
        
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update invoice')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to update invoice', {
        description: errorMessage
      })
      return null
    }
  }

  // Update invoice status
  const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<Invoice | null> => {
    try {
      const response = await fetch(`/api/invoices/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result: ApiResponse<Invoice> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update invoice status')
      }

      if (result.success && result.data) {
        toast.success(result.message || 'Invoice status updated!')
        
        // מחק cache של החשבונית הספציפית וכל החשבוניות
        appCache.delete(CACHE_KEYS.INVOICE(id))
        cacheUtils.invalidateInvoices()
        
        // רענן נתונים
        await refetch()
        
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update invoice status')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to update invoice status', {
        description: errorMessage
      })
      return null
    }
  }

  // Delete invoice
  const deleteInvoice = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete invoice')
      }

      if (result.success) {
        toast.success('Invoice deleted successfully!')
        
        // מחק cache של החשבונית הספציפית וכל החשבוניות
        appCache.delete(CACHE_KEYS.INVOICE(id))
        cacheUtils.invalidateInvoices()
        
        // רענן נתונים
        await refetch()
        
        return true
      } else {
        throw new Error(result.error || 'Failed to delete invoice')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to delete invoice', {
        description: errorMessage
      })
      return false
    }
  }

  return {
    invoices: invoices || [],
    loading,
    error,
    pagination,
    fetchInvoices: fetchCached,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    refreshInvoices: refetch,
  }
}

// Hook לחשבונית יחידה עם cache
export function useEnhancedInvoice(id: string) {
  const cacheKey = CACHE_KEYS.INVOICE(id)

  const fetcher = useCallback(async (): Promise<Invoice> => {
    const response = await fetch(`/api/invoices/${id}`)
    const data: ApiResponse<Invoice> = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch invoice')
    }

    if (data.success && data.data) {
      return data.data
    } else {
      throw new Error(data.error || 'Invoice not found')
    }
  }, [id])

  const {
    data: invoice,
    loading,
    error,
    refetch
  } = useCachedFetch(
    cacheKey,
    fetcher,
    CACHE_TTL.BUSINESS_DATA,
    [id]
  )

  return {
    invoice,
    loading,
    error,
    refetch,
  }
}

// Hook לסטטיסטיקות חשבוניות עם cache
export function useEnhancedInvoiceStats() {
  const cacheKey = CACHE_KEYS.INVOICE_STATS

  const fetcher = useCallback(async () => {
    // כאן נטען את כל החשבוניות ונחשב סטטיסטיקות
    const response = await fetch('/api/invoices?limit=1000')
    const data: PaginatedResponse<Invoice> = await response.json()

    if (data.success && data.data) {
      const invoices = data.data
      const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID)
      const pendingInvoices = invoices.filter(inv => 
        inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.DRAFT
      )
      const overdueInvoices = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE)
      
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)

      return {
        totalInvoices: invoices.length,
        paidInvoices: paidInvoices.length,
        pendingInvoices: pendingInvoices.length,
        overdueInvoices: overdueInvoices.length,
        totalRevenue,
      }
    }
    
    throw new Error('Failed to fetch invoice stats')
  }, [])

  const {
    data: stats,
    loading,
    error,
    refetch
  } = useCachedFetch(
    cacheKey,
    fetcher,
    CACHE_TTL.STATS // 10 minutes
  )

  return {
    totalInvoices: stats?.totalInvoices || 0,
    paidInvoices: stats?.paidInvoices || 0,
    pendingInvoices: stats?.pendingInvoices || 0,
    overdueInvoices: stats?.overdueInvoices || 0,
    totalRevenue: stats?.totalRevenue || 0,
    loading,
    error,
    refetch
  }
}