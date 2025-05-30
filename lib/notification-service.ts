// lib/notification-service.ts
import { db } from '@/lib/db'
import { NotificationType } from '@/types'

export interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  actionUrl?: string
}

export class NotificationService {
  /**
   * יצירת התראה חדשה
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await db.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || null,
          actionUrl: data.actionUrl || null,
          read: false
        }
      })

      console.log(`Notification created: ${notification.id} for user: ${data.userId}`)
      return notification
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  /**
   * התראה על חשבונית חדשה שנוצרה
   */
  static async notifyInvoiceCreated(invoice: any) {
    try {
      await this.createNotification({
        userId: invoice.userId,
        type: NotificationType.INVOICE_CREATED,
        title: 'חשבונית חדשה נוצרה',
        message: `חשבונית ${invoice.invoiceNumber} נוצרה בהצלחה עבור ${invoice.customer?.name}`,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.name,
          amount: invoice.total
        },
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    } catch (error) {
      console.error('Failed to create invoice notification:', error)
    }
  }

  /**
   * התראה על חשבונית ששולמה
   */
  static async notifyInvoicePaid(invoice: any) {
    try {
      await this.createNotification({
        userId: invoice.userId,
        type: NotificationType.INVOICE_PAID,
        title: 'חשבונית שולמה! 🎉',
        message: `חשבונית ${invoice.invoiceNumber} שולמה בסך ${invoice.total}₪`,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.name,
          amount: invoice.total
        },
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    } catch (error) {
      console.error('Failed to create payment notification:', error)
    }
  }

  /**
   * התראה על חשבונית שעברה פירעון
   */
  static async notifyInvoiceOverdue(invoice: any) {
    try {
      await this.createNotification({
        userId: invoice.userId,
        type: NotificationType.INVOICE_OVERDUE,
        title: 'חשבונית עברה פירעון ⚠️',
        message: `חשבונית ${invoice.invoiceNumber} עברה את מועד הפירעון`,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.name,
          amount: invoice.total,
          daysPastDue: Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24))
        },
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    } catch (error) {
      console.error('Failed to create overdue notification:', error)
    }
  }

  /**
   * תזכורת לפני מועד פירעון
   */
  static async notifyInvoiceReminder(invoice: any, daysBefore: number) {
    try {
      await this.createNotification({
        userId: invoice.userId,
        type: NotificationType.REMINDER,
        title: 'תזכורת: חשבונית קרובה לפירעון',
        message: `חשבונית ${invoice.invoiceNumber} תיפרע בעוד ${daysBefore} ימים`,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.name,
          amount: invoice.total,
          dueDate: invoice.dueDate,
          daysBefore
        },
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    } catch (error) {
      console.error('Failed to create reminder notification:', error)
    }
  }

  /**
   * בדיקת חשבוניות שעברו פירעון (לCron job)
   */
  static async checkOverdueInvoices() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // מציאת חשבוניות שעברו פירעון ועדיין לא שולמו
      const overdueInvoices = await db.invoice.findMany({
        where: {
          dueDate: {
            lt: today
          },
          status: {
            in: ['SENT'] // רק חשבוניות שנשלחו
          }
        },
        include: {
          customer: {
            select: {
              name: true
            }
          }
        }
      })

      console.log(`Found ${overdueInvoices.length} overdue invoices`)

      // עדכון סטטוס ויצירת התראות
      for (const invoice of overdueInvoices) {
        // עדכון סטטוס לOVERDUE
        await db.invoice.update({
          where: { id: invoice.id },
          data: { status: 'OVERDUE' }
        })

        // יצירת התראה
        await this.notifyInvoiceOverdue(invoice)
      }

      return overdueInvoices.length
    } catch (error) {
      console.error('Failed to check overdue invoices:', error)
      throw error
    }
  }

  /**
   * שליחת תזכורות לפני מועד פירעון (לCron job)
   */
  static async sendUpcomingReminders() {
    try {
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      threeDaysFromNow.setHours(23, 59, 59, 999)

      const oneDayFromNow = new Date()
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)
      oneDayFromNow.setHours(0, 0, 0, 0)

      // מציאת חשבוניות שיפרעו בעוד 3 ימים
      const upcomingInvoices = await db.invoice.findMany({
        where: {
          dueDate: {
            gte: oneDayFromNow,
            lte: threeDaysFromNow
          },
          status: 'SENT'
        },
        include: {
          customer: {
            select: {
              name: true
            }
          }
        }
      })

      console.log(`Found ${upcomingInvoices.length} upcoming invoices`)

      for (const invoice of upcomingInvoices) {
        const daysUntilDue = Math.ceil(
          (new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
        )
        
        await this.notifyInvoiceReminder(invoice, daysUntilDue)
      }

      return upcomingInvoices.length
    } catch (error) {
      console.error('Failed to send upcoming reminders:', error)
      throw error
    }
  }

  /**
   * מחיקת התראות ישנות (לניקוי תקופתי)
   */
  static async cleanupOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await db.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          read: true // מחק רק התראות שנקראו
        }
      })

      console.log(`Deleted ${result.count} old notifications`)
      return result.count
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error)
      throw error
    }
  }
}