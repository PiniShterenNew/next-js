// hooks/use-enhanced-customers.ts
'use client'

import { useState, useCallback } from 'react'
import { Customer, ApiResponse, PaginatedResponse, CreateCustomerData, UpdateCustomerData } from '@/types'
import { toast } from 'sonner'
import { appCache, CACHE_KEYS, CACHE_TTL, cacheUtils, useCachedFetch } from '@/lib/cache'

interface UseCustomersOptions {
  search?: string
  page?: number
  limit?: number
}

interface UseCustomersReturn {
  customers: Customer[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  // Actions
  fetchCustomers: (useCache?: boolean) => Promise<Customer[]>
  createCustomer: (data: CreateCustomerData) => Promise<Customer | null>
  updateCustomer: (id: string, data: UpdateCustomerData) => Promise<Customer | null>
  deleteCustomer: (id: string) => Promise<boolean>
  refreshCustomers: () => Promise<Customer[]>
}

export function useEnhancedCustomers({
  search = '',
  page = 1,
  limit = 10
}: UseCustomersOptions = {}): UseCustomersReturn {
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  // יצירת cache key ייחודי לפי הפרמטרים
  const cacheKey = CACHE_KEYS.CUSTOMERS({ search, page, limit })

  // Fetcher function
  const fetcher = useCallback(async (): Promise<Customer[]> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    })

    const response = await fetch(`/api/customers?${params}`)
    const data: PaginatedResponse<Customer> = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch customers')
    }

    if (data.success) {
      setPagination(data.pagination)
      return data.data || []
    } else {
      throw new Error(data.error || 'Failed to fetch customers')
    }
  }, [search, page, limit])

  // שימוש ב-cached fetch
  const {
    data: customers,
    loading,
    error,
    refetch,
    fetchCached
  } = useCachedFetch(
    cacheKey,
    fetcher,
    CACHE_TTL.BUSINESS_DATA,
    [search, page, limit]
  )

  // Create customer
  const createCustomer = async (data: CreateCustomerData): Promise<Customer | null> => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<Customer> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create customer')
      }

      if (result.success && result.data) {
        toast.success('Customer created successfully!')
        
        // מחק cache של לקוחות
        cacheUtils.invalidateCustomers()
        
        // רענן נתונים
        await refetch()
        
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create customer')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to create customer', {
        description: errorMessage
      })
      return null
    }
  }

  // Update customer
  const updateCustomer = async (id: string, data: UpdateCustomerData): Promise<Customer | null> => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<Customer> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update customer')
      }

      if (result.success && result.data) {
        toast.success('Customer updated successfully!')
        
        // מחק cache של הלקוח הספציפי וכל הלקוחות
        appCache.delete(CACHE_KEYS.CUSTOMER(id))
        cacheUtils.invalidateCustomers()
        
        // רענן נתונים
        await refetch()
        
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update customer')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to update customer', {
        description: errorMessage
      })
      return null
    }
  }

  // Delete customer
  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete customer')
      }

      if (result.success) {
        toast.success('Customer deleted successfully!')
        
        // מחק cache של הלקוח הספציפי וכל הלקוחות
        appCache.delete(CACHE_KEYS.CUSTOMER(id))
        cacheUtils.invalidateCustomers()
        
        // רענן נתונים
        await refetch()
        
        return true
      } else {
        throw new Error(result.error || 'Failed to delete customer')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to delete customer', {
        description: errorMessage
      })
      return false
    }
  }

  return {
    customers: customers || [],
    loading,
    error,
    pagination,
    fetchCustomers: fetchCached,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers: refetch,
  }
}

// Hook ללקוח יחיד עם cache
export function useEnhancedCustomer(id: string) {
  const cacheKey = CACHE_KEYS.CUSTOMER(id)

  const fetcher = useCallback(async (): Promise<Customer> => {
    const response = await fetch(`/api/customers/${id}`)
    const data: ApiResponse<Customer> = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch customer')
    }

    if (data.success && data.data) {
      return data.data
    } else {
      throw new Error(data.error || 'Customer not found')
    }
  }, [id])

  const {
    data: customer,
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
    customer,
    loading,
    error,
    refetch,
  }
}