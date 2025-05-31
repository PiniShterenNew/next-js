import { useCallback, useEffect, useState } from "react"

// lib/cache.ts - Smart Cache Layer
export interface CacheItem<T> {
    data: T
    timestamp: number
    ttl: number
    key: string
  }
  
  export class SmartCache {
    private cache = new Map<string, CacheItem<any>>()
    private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  
    /**
     * שמירת נתונים ב-cache
     */
    set<T>(key: string, data: T, ttlMinutes?: number): void {
      const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.DEFAULT_TTL
      
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
        key
      })
  
      // Debug log
      if (process.env.NODE_ENV === 'development') {
        console.log(`📦 Cache SET: ${key} (TTL: ${ttlMinutes || 5}min)`)
      }
    }
  
    /**
     * קבלת נתונים מה-cache
     */
    get<T>(key: string): T | null {
      const cached = this.cache.get(key)
      
      if (!cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Cache MISS: ${key}`)
        }
        return null
      }
  
      const isExpired = Date.now() - cached.timestamp > cached.ttl
      
      if (isExpired) {
        this.cache.delete(key)
        if (process.env.NODE_ENV === 'development') {
          console.log(`⏰ Cache EXPIRED: ${key}`)
        }
        return null
      }
  
      if (process.env.NODE_ENV === 'development') {
        const remainingTime = Math.round((cached.ttl - (Date.now() - cached.timestamp)) / 1000)
        console.log(`✅ Cache HIT: ${key} (${remainingTime}s remaining)`)
      }
  
      return cached.data
    }
  
    /**
     * בדיקה אם מפתח קיים ותקף
     */
    has(key: string): boolean {
      return this.get(key) !== null
    }
  
    /**
     * מחיקת מפתח ספציפי
     */
    delete(key: string): boolean {
      const deleted = this.cache.delete(key)
      if (deleted && process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Cache DELETE: ${key}`)
      }
      return deleted
    }
  
    /**
     * מחיקת מפתחות לפי pattern
     */
    invalidate(pattern: string): number {
      let deletedCount = 0
      
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
          deletedCount++
        }
      }
  
      if (process.env.NODE_ENV === 'development' && deletedCount > 0) {
        console.log(`🧹 Cache INVALIDATE: ${deletedCount} items matching "${pattern}"`)
      }
  
      return deletedCount
    }
  
    /**
     * ניקוי כל ה-cache
     */
    clear(): void {
      const size = this.cache.size
      this.cache.clear()
      if (process.env.NODE_ENV === 'development') {
        console.log(`🧽 Cache CLEAR: ${size} items removed`)
      }
    }
  
    /**
     * קבלת מידע על ה-cache
     */
    getStats() {
      const stats = {
        size: this.cache.size,
        keys: Array.from(this.cache.keys()),
        items: Array.from(this.cache.values()).map(item => ({
          key: item.key,
          age: Math.round((Date.now() - item.timestamp) / 1000),
          ttl: Math.round(item.ttl / 1000),
          remainingTime: Math.round((item.ttl - (Date.now() - item.timestamp)) / 1000)
        }))
      }
      return stats
    }
  
    /**
     * ניקוי פריטים שפגו
     */
    cleanup(): number {
      let cleanedCount = 0
      
      for (const [key, item] of this.cache) {
        const isExpired = Date.now() - item.timestamp > item.ttl
        if (isExpired) {
          this.cache.delete(key)
          cleanedCount++
        }
      }
  
      if (process.env.NODE_ENV === 'development' && cleanedCount > 0) {
        console.log(`🧹 Cache CLEANUP: ${cleanedCount} expired items removed`)
      }
  
      return cleanedCount
    }
  }
  
  // Global cache instance
  export const appCache = new SmartCache()
  
  // Cache keys constants
  export const CACHE_KEYS = {
    // Business data (5 minutes TTL)
    INVOICES: (params?: any) => `invoices-${JSON.stringify(params || {})}`,
    INVOICE: (id: string) => `invoice-${id}`,
    CUSTOMERS: (params?: any) => `customers-${JSON.stringify(params || {})}`,
    CUSTOMER: (id: string) => `customer-${id}`,
    NOTIFICATIONS: (params?: any) => `notifications-${JSON.stringify(params || {})}`,
    
    // Settings data (60 minutes TTL)
    USER_SETTINGS: 'user-settings',
    
    // Stats data (10 minutes TTL)
    INVOICE_STATS: 'invoice-stats',
    DASHBOARD_STATS: 'dashboard-stats',
  } as const
  
  // Cache TTL configurations
  export const CACHE_TTL = {
    BUSINESS_DATA: 5, // minutes
    SETTINGS: 60, // minutes
    STATS: 10, // minutes
    NOTIFICATIONS: 2, // minutes (more frequent updates)
  } as const
  
  // Enhanced hooks with caching
  export function useCachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes?: number,
    dependencies: any[] = []
  ) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
  
    const fetchData = useCallback(async (useCache = true) => {
      try {
        // בדוק cache קודם
        if (useCache) {
          const cached = appCache.get<T>(key)
          if (cached) {
            setData(cached)
            setError(null)
            return cached
          }
        }
  
        setLoading(true)
        setError(null)
  
        const result = await fetcher()
        setData(result)
        
        // שמור ב-cache
        appCache.set(key, result, ttlMinutes)
        
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    }, [key, fetcher, ttlMinutes])
  
    // טען נתונים בטעינה ראשונה או כשה-dependencies משתנים
    useEffect(() => {
      fetchData()
    }, [fetchData, ...dependencies])
  
    return {
      data,
      loading,
      error,
      refetch: () => fetchData(false), // force refresh
      fetchCached: () => fetchData(true)
    }
  }
  
  // Cache utilities for manual cache management
  export const cacheUtils = {
    /**
     * מחיקת cache של כל החשבוניות
     */
    invalidateInvoices() {
      appCache.invalidate('invoices')
      appCache.invalidate('invoice-stats')
      appCache.invalidate('dashboard-stats')
    },
  
    /**
     * מחיקת cache של כל הלקוחות
     */
    invalidateCustomers() {
      appCache.invalidate('customers')
    },
  
    /**
     * מחיקת cache של התראות
     */
    invalidateNotifications() {
      appCache.invalidate('notifications')
    },
  
    /**
     * מחיקת cache של הגדרות
     */
    invalidateSettings() {
      appCache.delete(CACHE_KEYS.USER_SETTINGS)
    },
  
    /**
     * מחיקת כל ה-cache
     */
    clearAll() {
      appCache.clear()
    },
  
    /**
     * קבלת סטטיסטיקות cache
     */
    getStats() {
      return appCache.getStats()
    }
  }
  
  // Auto cleanup - ניקוי אוטומטי כל 10 דקות
  if (typeof window !== 'undefined') {
    setInterval(() => {
      appCache.cleanup()
    }, 10 * 60 * 1000) // 10 minutes
  }