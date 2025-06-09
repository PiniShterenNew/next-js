'use client'

import { useUser } from '@clerk/nextjs'
import { ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Wifi, WifiOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/use-translation'
import { useSocket } from '@/hooks/use-socket'

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { user, isLoaded } = useUser()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUserVerified, setIsUserVerified] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const { t } = useTranslation()
  
  // ניהול חיבור הסוקט - יופעל רק כשהמשתמש מאומת
  const { socket, connected: socketConnected, error: socketError, reconnect } = useSocket()

  // הודעה על מצב חיבור הסוקט כשיש שינוי סטטוס
  useEffect(() => {
    // רק אם המשתמש מאומת והסוקט פעיל
    if (isUserVerified && socket) {
      if (socketConnected) {
        const id = socket.id ? socket.id.substring(0, 6) : 'unknown'
        console.log(`🔌 Socket connected successfully (${id})`)
      } else if (socketError) {
        console.warn('⚠️ Socket connection error:', socketError?.message)
      }
    }
  }, [isUserVerified, socket, socketConnected, socketError])

  // טיפול בהודעות Socket.io
  useEffect(() => {
    if (isUserVerified && socket && socketConnected) {
      // האזנה לאירוע התראה חדשה
      socket.on('notification', (notification) => {
        // בדיקה אם זו התראה חדשה שנוצרה כעת
        if (notification?.isNew) {
          toast(notification.title, {
            description: notification.message,
            duration: 5000,
            action: notification.actionUrl ? {
              label: t('notifications.view'),
              onClick: () => notification.actionUrl && router.push(notification.actionUrl)
            } : undefined
          })
        }
      })

      // ניקוי הרשמות לאירועים בעת יציאה
      return () => {
        socket.off('notification')
      }
    }
  }, [isUserVerified, socket, socketConnected, router, t])
  
  useEffect(() => {
    // רק אם המשתמש טעון ויש לנו מידע עליו
    if (isLoaded && user && !isProcessing) {
      const handleUserSync = async () => {
        try {
          setIsProcessing(true)
          
          // קריאה ל-API לסנכרון המשתמש
          const response = await fetch('/api/user/sync')
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
          }
          
          const data = await response.json()
          
          if (data.isNew) {
            toast.success(t('user.welcome'))
          }
          
          // סימון שהמשתמש אומת מול מסד הנתונים
          setIsUserVerified(true)
          setError(null)
        } catch (error) {
          console.error('Error synchronizing user:', error)
          setError(error instanceof Error ? error : new Error(t('user.syncError')))
          toast.error(t('user.syncError'))
          
          // ניסיון נוסף אחרי 2 שניות
          setTimeout(() => {
            setIsProcessing(false)
          }, 2000)
          
          return
        } 
      }

      handleUserSync()
    }
  }, [user, isLoaded, isProcessing])

  // אם עדיין לא טעון, מציגים מסך טעינה
  if (!isLoaded || (isLoaded && user && !isUserVerified && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="max-w-md space-y-6">
          <Loader2 className="h-12 w-12 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold">{t('user.loading')}</h2>
          <p className="text-muted-foreground">
            {t('user.loadingDescription')}
          </p>
        </div>
      </div>
    )
  }

  // אם יש שגיאה, מציגים מסך שגיאה עם אפשרות לנסות שוב
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="max-w-md space-y-6">
          <h2 className="text-2xl font-bold">{t('user.errorTitle')}</h2>
          <p className="text-muted-foreground">
            {t('user.errorDescription')}
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => {
                setIsProcessing(false)
                setError(null)
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // רק אם המשתמש אומת בהצלחה, מציגים את תוכן הדשבורד
  return <>{children}</>
}
