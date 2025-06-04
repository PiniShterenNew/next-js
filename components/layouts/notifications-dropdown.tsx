// components/layout/notifications-dropdown.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useNotifications, NotificationType } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  DollarSign,
  AlertTriangle,
  Calendar,
  X,
  Eye
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications({
    limit: 10,
    polling: true
  })
  const { t } = useTranslation()

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INVOICE_CREATED:
        return <FileText className="w-4 h-4 text-blue-500" />
      case NotificationType.INVOICE_PAID:
        return <DollarSign className="w-4 h-4 text-green-500" />
      case NotificationType.INVOICE_OVERDUE:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case NotificationType.REMINDER:
        return <Calendar className="w-4 h-4 text-orange-500" />
      case NotificationType.PAYMENT_RECEIVED:
        return <DollarSign className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    if (notification.actionUrl) {
      setIsOpen(false)
      // Navigation will happen via Link component
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteNotification(notificationId)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0 min-w-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel>{t('notifications.dropdown.title')}</DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-8 px-2 text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              {t('notifications.dropdown.markAllRead')}
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              {t('notifications.dropdown.loading')}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('notifications.dropdown.empty.title')}</p>
              <p className="text-xs mt-1">{t('notifications.dropdown.empty.description')}</p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={handleDeleteNotification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-center">
                <Eye className="w-4 h-4 mr-2" />
                {t('notifications.dropdown.viewAll')}
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface NotificationItemProps {
  notification: any
  onMarkAsRead: (id: string) => Promise<void>
  onDelete: (e: React.MouseEvent, id: string) => Promise<void>
  onClick: () => void
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick
}: NotificationItemProps) {
  const { t } = useTranslation()
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INVOICE_CREATED:
        return <FileText className="w-4 h-4 text-blue-500" />
      case NotificationType.INVOICE_PAID:
        return <DollarSign className="w-4 h-4 text-green-500" />
      case NotificationType.INVOICE_OVERDUE:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case NotificationType.REMINDER:
        return <Calendar className="w-4 h-4 text-orange-500" />
      case NotificationType.PAYMENT_RECEIVED:
        return <DollarSign className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer relative group",
        !notification.read && "bg-primary/5 border-l-2 border-l-primary"
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 gap-1">
        <div className="flex items-start justify-between">
          <p className={cn(
            "text-sm truncate",
            !notification.read ? "font-semibold" : "font-medium"
          )}>
            {notification.title}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onMarkAsRead(notification.id)
                }}
              >
                <Check className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={(e) => onDelete(e, notification.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt, 'MMM dd, HH:mm')}
          </span>
          {!notification.read && (
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl}>
        {content}
      </Link>
    )
  }

  return content
}