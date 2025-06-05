// app/api/notifications/mark-all-read/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { requireDbUser } from '@/lib/auth-utils'
import { ApiResponse } from '@/types'

// PATCH /api/notifications/mark-all-read - סימון כל ההתראות כנקראו
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireDbUser(request)
    if (currentUser instanceof NextResponse) return currentUser
    const user = currentUser

    // עדכון כל ההתראות הלא נקראות של המשתמש
    const result = await db.notification.updateMany({
      where: {
        userId: user.id,
        read: false
      },
      data: {
        read: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      data: { updatedCount: result.count }
    } as ApiResponse)

  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' } as ApiResponse,
      { status: 500 }
    )
  }
}