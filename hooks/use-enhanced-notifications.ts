// hooks/use-enhanced-notifications.ts
'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { useGlobalApp } from '@/context/AppContext'
import { appCache, CACHE_KEYS, CACHE_TTL, cacheUtils, useCachedFetch } from '@/lib/cache'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  actionUrl?: string
  createdAt: Date
  updatedAt: Date
}

export enum NotificationType {
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_OVERDUE = 'INVOICE_OVERDUE',
  INVOICE_PAID = 'INVOICE_PAID',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  REMINDER = 'REMINDER'
}

interface UseNotificationsOptions {
  page?: number
  limit?: number
  unreadOnly?: boolean
  polling?: boolean
  pollingInterval?: number
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  // Actions
  fetchNotifications: (useCache?: boolean) => Promise<Notification[]>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refreshNotifications: () => Promise<Notification[]>
}

export function useEnhancedNotifications({
  page = 1,
  limit = 20,
  unreadOnly = false,
  polling = false,
  pollingInterval = 60000
}: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { actions: globalActions } = useGlobalApp()
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  // יצירת cache key ייחודי לפי הפרמטרים
  const cacheKey = CACHE_KEYS.NOTIFICATIONS({ page, limit, unreadOnly })

  // Fetcher function
  const fetcher = useCallback(async (): Promise<Notification[]> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(unreadOnly && { unreadOnly: 'true' })
    })

    const response = await fetch(`/api/notifications?${params}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch notifications')
    }

    if (data.success) {
      setPagination(data.pagination)
      
      // עדכן את הספירה ב-Global State
      globalActions.updateUnreadCount(data.unreadCount || 0)
      
      return data.data || []
    } else {
      throw new Error(data.error || 'Failed to fetch notifications')
    }
  }, [page, limit, unreadOnly, globalActions])

  // שימוש ב-cached fetch
  const {
    data: notifications,
    loading,
    error,
    refetch,
    fetchCached
  } = useCachedFetch(
    cacheKey,
    fetcher,
    CACHE_TTL.NOTIFICATIONS,
    [page, limit, unreadOnly]
  )

  // Get unread count from Global State
  const { state } = useGlobalApp()
  const unreadCount = state.unreadNotificationsCount

  // Mark notification as read
  const markAsRead = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark notification as read')
      }

      if (result.success) {
        // עדכן Global State
        globalActions.updateUnreadCount(Math.max(0, unreadCount - 1))
        
        // מחק cache של התראות
        cacheUtils.invalidateNotifications()
        
        // רענן נתונים
        await refetch()
        
        toast.success('Notification marked as read')
      } else {
        throw new Error(result.error || 'Failed to mark notification as read')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to mark notification as read', {
        description: errorMessage
      })
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    try {
      const response = await fetchWithAuth('/api/notifications/mark-all-read', {
        method: 'PATCH',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark all notifications as read')
      }

      if (result.success) {
        // איפוס ב-Global State
        globalActions.updateUnreadCount(0)
        
        // מחק cache של התראות
        cacheUtils.invalidateNotifications()
        
        // רענן נתונים
        await refetch()
        
        toast.success(`Marked ${result.data.updatedCount} notifications as read`)
      } else {
        throw new Error(result.error || 'Failed to mark all notifications as read')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to mark all notifications as read', {
        description: errorMessage
      })
    }
  }

  // Delete notification
  const deleteNotification = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete notification')
      }

      if (result.success) {
        // בדוק אם ההתראה הייתה לא נקראה
        const deletedNotification = notifications?.find(n => n.id === id)
        if (deletedNotification && !deletedNotification.read) {
          globalActions.updateUnreadCount(Math.max(0, unreadCount - 1))
        }
        
        // מחק cache של התראות
        cacheUtils.invalidateNotifications()
        
        // רענן נתונים
        await refetch()
        
        toast.success('Notification deleted')
      } else {
        throw new Error(result.error || 'Failed to delete notification')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to delete notification', {
        description: errorMessage
      })
    }
  }

  return {
    notifications: notifications || [],
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications: fetchCached,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: refetch,
  }
}

// Hook לקבלת התראה בודדת עם cache
export function useEnhancedNotification(id: string) {
  const cacheKey = `notification-${id}`

  const fetcher = useCallback(async (): Promise<Notification> => {
    const response = await fetch(`/api/notifications/${id}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch notification')
    }

    if (data.success && data.data) {
      return data.data
    } else {
      throw new Error(data.error || 'Notification not found')
    }
  }, [id])

  const {
    data: notification,
    loading,
    error,
    refetch
  } = useCachedFetch(
    cacheKey,
    fetcher,
    CACHE_TTL.NOTIFICATIONS,
    [id]
  )

  return {
    notification,
    loading,
    error,
    refetch,
  }
}

// Hook לספירת התראות לא נקראות (משתמש ב-Global State)
export function useUnreadNotificationsCount() {
  const { state, actions } = useGlobalApp()
  
  return { 
    unreadCount: state.unreadNotificationsCount, 
    loading: false, 
    refetch: async () => {
      // רענן דרך fetch של כל ההתראות
      const response = await fetchWithAuth('/api/notifications?limit=1&unreadOnly=true')
      const data = await response.json()
      if (data.success) {
        actions.updateUnreadCount(data.unreadCount || 0)
      }
    }
  }
}