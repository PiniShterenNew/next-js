// app/dashboard/notifications/page.tsx
'use client'

import { useState } from 'react'
import { useNotifications, NotificationType } from '@/hooks/use-notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Bell, 
  Check, 
  CheckCheck,
  FileText, 
  DollarSign,
  AlertTriangle,
  Calendar,
  X,
  MoreVertical,
  Filter,
  Trash2,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null)
  
  const { 
    notifications, 
    unreadCount,
    loading, 
    error,
    pagination,
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    refreshNotifications 
  } = useNotifications({
    page,
    limit: 20,
    unreadOnly: filter === 'unread'
  })

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INVOICE_CREATED:
        return <FileText className="w-5 h-5 text-blue-500" />
      case NotificationType.INVOICE_PAID:
        return <DollarSign className="w-5 h-5 text-green-500" />
      case NotificationType.INVOICE_OVERDUE:
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case NotificationType.REMINDER:
        return <Calendar className="w-5 h-5 text-orange-500" />
      case NotificationType.PAYMENT_RECEIVED:
        return <DollarSign className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId)
    setSelectedNotification(null)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading notifications: {error}</p>
            <Button onClick={refreshNotifications} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your business activity
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter('all')
                    setPage(1)
                  }}
                >
                  All Notifications
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter('unread')
                    setPage(1)
                  }}
                >
                  Unread Only
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {pagination ? `${pagination.total} notifications` : 'Loading...'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? "You're all caught up! All notifications have been read."
                  : "We'll notify you when something important happens with your invoices."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => markAsRead(notification.id)}
              onDelete={() => setSelectedNotification(notification.id)}
              onClick={() => handleNotificationClick(notification)}
              getIcon={getNotificationIcon}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!selectedNotification} 
        onOpenChange={() => setSelectedNotification(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedNotification && handleDeleteNotification(selectedNotification)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface NotificationCardProps {
  notification: any
  onMarkAsRead: () => void
  onDelete: () => void
  onClick: () => void
  getIcon: (type: NotificationType) => React.ReactNode
}

function NotificationCard({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onClick,
  getIcon 
}: NotificationCardProps) {
  const content = (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md cursor-pointer",
      !notification.read && "border-l-4 border-l-primary bg-primary/5"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            {getIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={cn(
                  "text-base font-medium mb-1",
                  !notification.read && "font-semibold"
                )}>
                  {notification.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{formatDate(notification.createdAt, 'MMM dd, yyyy • HH:mm')}</span>
                  {!notification.read && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 opacity-50 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.read && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        onMarkAsRead()
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // אם יש קישור לפעולה, עטוף ב-Link
  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return <div onClick={onClick}>{content}</div>
}