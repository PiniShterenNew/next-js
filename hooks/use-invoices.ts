'use client'

import { useState, useEffect, useCallback } from 'react'
import { Invoice, ApiResponse, PaginatedResponse, CreateInvoiceData, UpdateInvoiceData, InvoiceStatus } from '@/types'
import { toast } from 'sonner'

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
  fetchInvoices: () => Promise<void>
  createInvoice: (data: CreateInvoiceData) => Promise<Invoice | null>
  updateInvoice: (id: string, data: UpdateInvoiceData) => Promise<Invoice | null>
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<Invoice | null>
  deleteInvoice: (id: string) => Promise<boolean>
  refreshInvoices: () => Promise<void>
}

export function useInvoices({
  search = '',
  status = 'all',
  customerId = '',
  page = 1,
  limit = 10
}: UseInvoicesOptions = {}): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

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
        setInvoices(data.data || [])
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || 'Failed to fetch invoices')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to load invoices', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }, [search, status, customerId, page, limit])

  // Create invoice
  const createInvoice = async (data: CreateInvoiceData): Promise<Invoice | null> => {
    try {
      setError(null)

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
        await refreshInvoices()
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create invoice')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to create invoice', {
        description: errorMessage
      })
      return null
    }
  }

  // Update invoice
  const updateInvoice = async (id: string, data: UpdateInvoiceData): Promise<Invoice | null> => {
    try {
      setError(null)

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
        await refreshInvoices()
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update invoice')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to update invoice', {
        description: errorMessage
      })
      return null
    }
  }

  // Update invoice status
  const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<Invoice | null> => {
    try {
      setError(null)

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
        await refreshInvoices()
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update invoice status')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to update invoice status', {
        description: errorMessage
      })
      return null
    }
  }

  // Delete invoice
  const deleteInvoice = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete invoice')
      }

      if (result.success) {
        toast.success('Invoice deleted successfully!')
        await refreshInvoices()
        return true
      } else {
        throw new Error(result.error || 'Failed to delete invoice')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to delete invoice', {
        description: errorMessage
      })
      return false
    }
  }

  // Refresh invoices (useful after mutations)
  const refreshInvoices = async () => {
    await fetchInvoices()
  }

  // Initial fetch
  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return {
    invoices,
    loading,
    error,
    pagination,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    refreshInvoices,
  }
}

// Hook for single invoice
export function useInvoice(id: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoice = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/invoices/${id}`)
      const data: ApiResponse<Invoice> = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invoice')
      }

      if (data.success && data.data) {
        setInvoice(data.data)
      } else {
        throw new Error(data.error || 'Invoice not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to load invoice', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  return {
    invoice,
    loading,
    error,
    refetch: fetchInvoice,
  }
}

// Hook for invoice statistics
export function useInvoiceStats() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    loading: true
  })

  const fetchStats = useCallback(async () => {
    try {
      // For now, we'll calculate basic stats from all invoices
      // In the future, we can create a dedicated API endpoint for this
      const response = await fetch('/api/invoices?limit=1000') // Get all invoices
      const data: PaginatedResponse<Invoice> = await response.json()

      if (data.success && data.data) {
        const invoices = data.data
        const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID)
        const pendingInvoices = invoices.filter(inv => 
          inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.DRAFT
        )
        const overdueInvoices = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE)
        
        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)

        setStats({
          totalInvoices: invoices.length,
          paidInvoices: paidInvoices.length,
          pendingInvoices: pendingInvoices.length,
          overdueInvoices: overdueInvoices.length,
          totalRevenue,
          loading: false
        })
      }
    } catch (error) {
      console.error('Failed to fetch invoice stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { ...stats, refetch: fetchStats }
}