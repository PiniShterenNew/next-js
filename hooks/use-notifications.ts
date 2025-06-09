// hooks/use-notifications.ts - תיקון
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { NotificationType } from '@prisma/client'
import { useSocket } from './use-socket'

// Re-export NotificationType from Prisma
export { NotificationType }

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

// NotificationType מיובא מ-Prisma

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
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refreshNotifications: () => Promise<void>
}

export function useNotifications({
  page = 1,
  limit = 20,
  unreadOnly = false,
  polling = false, 
  pollingInterval = 60000 // דקה אחת
}: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)
  
  // Socket.io connection
  const { socket, connected } = useSocket()

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

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
        setNotifications(data.data || [])
        setUnreadCount(data.unreadCount || 0)
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || 'Failed to fetch notifications')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Failed to fetch notifications:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page, limit, unreadOnly])

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
        // עדכון הסטטוס המקומי
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true }
              : notification
          )
        )
        
        // עדכון מספר ההתראות הלא נקראות
        setUnreadCount(prev => Math.max(0, prev - 1))
        
        toast.success('Notification marked as read')
      } else {
        throw new Error(result.error || 'Failed to mark notification as read')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to mark notification as read', {
        description: errorMessage
      })
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark all notifications as read')
      }

      if (result.success) {
        // עדכון כל ההתראות כנקראות
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        )
        
        // איפוס מספר ההתראות הלא נקראות
        setUnreadCount(0)
        
        toast.success(`Marked ${result.data.updatedCount} notifications as read`)
      } else {
        throw new Error(result.error || 'Failed to mark all notifications as read')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
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
        // הסרת ההתראה מהרשימה
        const deletedNotification = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(notification => notification.id !== id))
        
        // עדכון מספר ההתראות הלא נקראות אם ההתראה לא הייתה נקראה
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        
        toast.success('Notification deleted')
      } else {
        throw new Error(result.error || 'Failed to delete notification')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to delete notification', {
        description: errorMessage
      })
    }
  }

  // Refresh notifications (useful after mutations)
  const refreshNotifications = async () => {
    await fetchNotifications()
  }

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !connected) return
    
    // Listen for new notifications
    socket.on('notification', (newNotification: Notification) => {
      console.log('🔌 Received notification via socket:', newNotification)
      
      // Add the new notification to the list if it's not already there
      setNotifications(prev => {
        if (prev.some(n => n.id === newNotification.id)) return prev
        return [newNotification, ...prev]
      })
      
      // Update unread count
      if (!newNotification.read) {
        setUnreadCount(prev => prev + 1)
      }
      
      // Show toast notification
      toast(newNotification.title, {
        description: newNotification.message,
      })
    })
    
    return () => {
      socket.off('notification')
    }
  }, [socket, connected])
  
  // Fallback to polling if socket is not connected and polling is requested
  useEffect(() => {
    if (!polling || (socket && connected)) return

    console.log('🕐 Socket not connected, falling back to polling')
    const interval = setInterval(() => {
      fetchNotifications()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [polling, pollingInterval, fetchNotifications, socket, connected])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  }
}

// Hook לקבלת התראה בודדת
export function useNotification(id: string) {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotification = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/notifications/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notification')
      }

      if (data.success && data.data) {
        setNotification(data.data)
      } else {
        throw new Error(data.error || 'Notification not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Failed to fetch notification:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchNotification()
  }, [fetchNotification])

  return {
    notification,
    loading,
    error,
    refetch: fetchNotification,
  }
}

// Hook לספירת התראות לא נקראות בלבד
export function useUnreadNotificationsCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { socket, connected } = useSocket()

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=1&unreadOnly=true')
      const data = await response.json()

      if (data.success) {
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])
  
  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !connected) return
    
    // Listen for new notifications
    socket.on('notification', (notification: Notification) => {
      if (!notification.read) {
        setUnreadCount(prev => prev + 1)
      }
    })
    
    // Listen for notification updates
    socket.on('notification_read', (notificationId: string) => {
      setUnreadCount(prev => Math.max(0, prev - 1))
    })
    
    socket.on('notifications_read_all', () => {
      setUnreadCount(0)
    })
    
    return () => {
      socket.off('notification')
      socket.off('notification_read')
      socket.off('notifications_read_all')
    }
  }, [socket, connected])
  
  // Fallback to polling if socket is not connected
  useEffect(() => {
    if (socket && connected) return
    
    console.log('🕐 Socket not connected, falling back to polling for unread count')
    const interval = setInterval(fetchUnreadCount, 120000) // עדכון כל 2 דקות (פחות אגרסיבי)
    return () => clearInterval(interval)
  }, [fetchUnreadCount, socket, connected])

  return { unreadCount, loading, refetch: fetchUnreadCount }
}