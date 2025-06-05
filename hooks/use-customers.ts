'use client'

import { useState, useEffect, useCallback } from 'react'
import { Customer, ApiResponse, PaginatedResponse, CreateCustomerData, UpdateCustomerData } from '@/types'
import { toast } from 'sonner'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

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
  fetchCustomers: () => Promise<void>
  createCustomer: (data: CreateCustomerData) => Promise<Customer | null>
  updateCustomer: (id: string, data: UpdateCustomerData) => Promise<Customer | null>
  deleteCustomer: (id: string) => Promise<boolean>
  refreshCustomers: () => Promise<void>
}

export function useCustomers({
  search = '',
  page = 1,
  limit = 10
}: UseCustomersOptions = {}): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

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
        setCustomers(data.data || [])
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || 'Failed to fetch customers')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to load customers', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }, [search, page, limit])

  // Create customer
  const createCustomer = async (data: CreateCustomerData): Promise<Customer | null> => {
    try {
      setError(null)

      const response = await fetchWithAuth('/api/customers', {
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
        await refreshCustomers()
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create customer')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to create customer', {
        description: errorMessage
      })
      return null
    }
  }

  // Update customer
  const updateCustomer = async (id: string, data: UpdateCustomerData): Promise<Customer | null> => {
    try {
      setError(null)

      const response = await fetchWithAuth(`/api/customers/${id}`, {
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
        await refreshCustomers()
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update customer')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to update customer', {
        description: errorMessage
      })
      return null
    }
  }

  // Delete customer
  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetchWithAuth(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete customer')
      }

      if (result.success) {
        toast.success('Customer deleted successfully!')
        await refreshCustomers()
        return true
      } else {
        throw new Error(result.error || 'Failed to delete customer')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to delete customer', {
        description: errorMessage
      })
      return false
    }
  }

  // Refresh customers (useful after mutations)
  const refreshCustomers = async () => {
    await fetchCustomers()
  }

  // Initial fetch
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return {
    customers,
    loading,
    error,
    pagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers,
  }
}

// Hook for single customer
export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomer = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetchWithAuth(`/api/customers/${id}`)
      const data: ApiResponse<Customer> = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customer')
      }

      if (data.success && data.data) {
        setCustomer(data.data)
      } else {
        throw new Error(data.error || 'Customer not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to load customer', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  return {
    customer,
    loading,
    error,
    refetch: fetchCustomer,
  }
}