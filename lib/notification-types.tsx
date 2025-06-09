// lib/notification-types.tsx
'use client'

import { NotificationType } from '@prisma/client'
import {
  Bell,
  FileText,
  DollarSign,
  AlertTriangle,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Settings
} from 'lucide-react'
import { ReactNode } from 'react'

// Helper function to get notification icon based on type
export const getNotificationIcon = (type: NotificationType): ReactNode => {
  switch (type) {
    case 'INVOICE_CREATED':
      return <FileText className="w-4 h-4 text-blue-500" />
    case 'INVOICE_PAID':
      return <DollarSign className="w-4 h-4 text-green-500" />
    case 'INVOICE_OVERDUE':
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case 'REMINDER':
      return <Calendar className="w-4 h-4 text-orange-500" />
    case 'PAYMENT_RECEIVED':
      return <DollarSign className="w-4 h-4 text-green-500" />
    case 'CUSTOMER_CREATED':
      return <Users className="w-4 h-4 text-blue-500" />
    case 'CUSTOMER_UPDATED':
      return <UserCheck className="w-4 h-4 text-blue-500" />
    case 'CUSTOMER_DELETED':
      return <UserX className="w-4 h-4 text-red-500" />
    case 'SETTINGS_UPDATED':
      return <Settings className="w-4 h-4 text-purple-500" />
    default:
      return <Bell className="w-4 h-4 text-gray-500" />
  }
}
