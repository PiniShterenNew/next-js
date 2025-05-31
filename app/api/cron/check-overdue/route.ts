// app/api/cron/check-overdue/route.ts - API לבדיקת חשבוניות שעברו פירעון
import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'

// POST /api/cron/check-overdue - בדיקת חשבוניות שעברו פירעון
export async function POST(request: NextRequest) {
  try {
    // בדיקה שהקריאה מגיעה מCron job (אופציונלי)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 Starting overdue invoices check...')
    
    // בדיקת חשבוניות שעברו פירעון
    const overdueCount = await NotificationService.checkOverdueInvoices()
    
    // שליחת תזכורות לחשבוניות שקרובות לפירעון
    const reminderCount = await NotificationService.sendUpcomingReminders()
    
    // ניקוי התראות ישנות (אופציונלי)
    const cleanedCount = await NotificationService.cleanupOldNotifications(30)

    console.log(`✅ Cron job completed:`)
    console.log(`   - ${overdueCount} invoices marked as overdue`)
    console.log(`   - ${reminderCount} reminders sent`)
    console.log(`   - ${cleanedCount} old notifications cleaned`)

    return NextResponse.json({
      success: true,
      data: {
        overdueInvoices: overdueCount,
        remindersSent: reminderCount,
        notificationsCleaned: cleanedCount
      },
      message: 'Cron job completed successfully'
    })

  } catch (error) {
    console.error('❌ Cron job failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute cron job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/cron/check-overdue - בדיקת סטטוס (לבדיקות ידניות)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cron endpoint is working',
    timestamp: new Date().toISOString()
  })
}