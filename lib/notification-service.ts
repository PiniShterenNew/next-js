// lib/notification-service.ts - תיקון
import { db } from '@/lib/db'
import { NotificationType, type Customer, type UserSettings } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

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

      console.log(`✅ Notification created: ${notification.id} for user: ${data.userId}`)
      return notification
    } catch (error) {
      console.error('❌ Failed to create notification:', error)
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
        title: 'חשבונית חדשה נוצרה בהצלחה',
        message: `חשבונית ${invoice.invoiceNumber} נוצרה עבור ${invoice.customer?.name || 'לקוח'}`,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.name,
          amount: Number(invoice.total)
        },
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    } catch (error) {
      console.error('❌ Failed to create invoice notification:', error)
    }
  }

  /**
   * התראה על עדכון חשבונית
   */
  static async notifyInvoiceUpdated(invoice: any, updatedFields: string[]) {
    try {
      await this.createNotification({
        userId: invoice.userId,
        type: NotificationType.INVOICE_UPDATED,
        title: 'חשבונית עודכנה',
        message: `חשבונית ${invoice.invoiceNumber} עודכנה (שינויים: ${updatedFields.join(', ')})`,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          updatedFields,
          updatedAt: new Date()
        },
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    } catch (error) {
      console.error('❌ Failed to create invoice updated notification:', error)
    }
  }

  /**
   * התראה על מחיקת חשבונית
   */
  static async notifyInvoiceDeleted(invoice: any) {
    try {
      await this.createNotification({
        userId: invoice.userId,
        type: NotificationType.INVOICE_DELETED,
        title: 'חשבונית נמחקה',
        message: `החשבונית ${invoice.invoiceNumber} נמחקה מהמערכת`,
        data: {
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.name,
          deletedAt: new Date()
        }
      })
    } catch (error) {
      console.error('❌ Failed to create invoice deleted notification:', error)
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
        title: 'תשולם בהצלחה! 🎉',
        message: `החשבונית ${invoice.invoiceNumber} שולמה - ${new Intl.NumberFormat('he-IL', {
          style: 'currency',
          currency: 'ILS',
        }).format(Number(invoice.total))}`,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.name,
          amount: Number(invoice.total),
          paidAt: new Date()
        },
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    } catch (error) {
      console.error('❌ Failed to create payment notification:', error)
    }
  }

  /**
   * התראה על חשבונית שעברה פירעון
   */
  static async notifyInvoiceOverdue(invoice: any) {
    try {
      const daysPastDue = Math.floor(
        (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24)
      )
      const formattedDate = format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: he })

      await this.createNotification({
        userId: invoice.userId,
        type: NotificationType.INVOICE_OVERDUE,
        title: 'חשבונית באיחור ⚠️',
        message: `חשבונית ${invoice.invoiceNumber} איחור של ${daysPastDue} ימים (תאריך יעד: ${formattedDate})`,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.name,
          dueDate: invoice.dueDate,
          daysPastDue,
          amount: Number(invoice.total)
        },
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    } catch (error) {
      console.error('❌ Failed to create overdue notification:', error)
    }
  }

  /**
   * תזכורת לפני מועד פירעון
   */
  static async notifyInvoiceReminder(invoice: any, daysBefore: number) {
    try {
      const formattedDate = format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: he })
      
      await this.createNotification({
        userId: invoice.userId,
        type: NotificationType.REMINDER,
        title: 'תזכורת: תאריך יעד מתקרב',
        message: `חשבונית ${invoice.invoiceNumber} תפוג בעוד ${daysBefore} ימים (${formattedDate})`,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.name,
          amount: Number(invoice.total),
          dueDate: invoice.dueDate,
          daysBefore
        },
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    } catch (error) {
      console.error('❌ Failed to create reminder notification:', error)
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

      console.log(`🔍 Found ${overdueInvoices.length} overdue invoices`)

      // עדכון סטטוס ויצירת התראות
      for (const invoice of overdueInvoices) {
        // עדכון סטטוס לOVERDUE
        await db.invoice.update({
          where: { id: invoice.id },
          data: { status: 'OVERDUE' }
        })

        // יצירת התראה
        await this.notifyInvoiceOverdue({
          ...invoice,
          userId: invoice.userId
        })
      }

      return overdueInvoices.length
    } catch (error) {
      console.error('❌ Failed to check overdue invoices:', error)
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

      console.log(`📅 Found ${upcomingInvoices.length} upcoming invoices`)

      for (const invoice of upcomingInvoices) {
        const daysUntilDue = Math.ceil(
          (new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
        )
        
        await this.notifyInvoiceReminder({
          ...invoice,
          userId: invoice.userId
        }, daysUntilDue)
      }

      return upcomingInvoices.length
    } catch (error) {
      console.error('❌ Failed to send upcoming reminders:', error)
      throw error
    }
  }

  /**
   * התראה על לקוח חדש שנוסף
   */
  static async notifyCustomerCreated(customer: Customer) {
    try {
      await this.createNotification({
        userId: customer.userId,
        type: NotificationType.CUSTOMER_CREATED,
        title: 'לקוח חדש נוסף',
        message: `הלקוח ${customer.name} נוסף למערכת`,
        data: {
          customerId: customer.id,
          customerName: customer.name,
          email: customer.email,
          createdAt: new Date()
        },
        actionUrl: `/dashboard/customers/${customer.id}`
      })
    } catch (error) {
      console.error('❌ Failed to create customer created notification:', error)
    }
  }

  /**
   * התראה על עדכון פרטי לקוח
   */
  static async notifyCustomerUpdated(customer: Customer, updatedFields: string[]) {
    try {
      await this.createNotification({
        userId: customer.userId,
        type: NotificationType.CUSTOMER_UPDATED,
        title: 'פרטי לקוח עודכנו',
        message: `פרטי הלקוח ${customer.name} עודכנו (${updatedFields.join(', ')})`,
        data: {
          customerId: customer.id,
          customerName: customer.name,
          updatedFields,
          updatedAt: new Date()
        },
        actionUrl: `/dashboard/customers/${customer.id}`
      })
    } catch (error) {
      console.error('❌ Failed to create customer updated notification:', error)
    }
  }

  /**
   * התראה על מחיקת לקוח
   */
  static async notifyCustomerDeleted(customer: Customer) {
    try {
      await this.createNotification({
        userId: customer.userId,
        type: NotificationType.CUSTOMER_DELETED,
        title: 'לקוח נמחק',
        message: `הלקוח ${customer.name} נמחק מהמערכת`,
        data: {
          customerName: customer.name,
          email: customer.email,
          deletedAt: new Date()
        }
      })
    } catch (error) {
      console.error('❌ Failed to create customer deleted notification:', error)
    }
  }

  /**
   * התראה על עדכון הגדרות
   */
  static async notifySettingsUpdated(settings: UserSettings, updatedFields: string[]) {
    try {
      await this.createNotification({
        userId: settings.userId,
        type: NotificationType.SETTINGS_UPDATED,
        title: 'הגדרות המערכת עודכנו',
        message: `ההגדרות עודכנו (${updatedFields.join(', ')})`,
        data: {
          updatedFields,
          updatedAt: new Date(),
          previousSettings: settings
        },
        actionUrl: '/dashboard/settings'
      })
    } catch (error) {
      console.error('❌ Failed to create settings updated notification:', error)
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

      console.log(`🧹 Deleted ${result.count} old notifications`)
      return result.count
    } catch (error) {
      console.error('❌ Failed to cleanup old notifications:', error)
      throw error
    }
  }
}