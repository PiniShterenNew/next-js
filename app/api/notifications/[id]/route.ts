// app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { requireDbUser } from '@/lib/auth-utils'
import { ApiResponse } from '@/types'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/notifications/[id] - קבלת התראה ספציפית
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = await requireDbUser(request)
    if (currentUser instanceof NextResponse) return currentUser
    const user = currentUser

    const notification = await db.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id, // וידוא שההתראה שייכת למשתמש
      }
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' } as ApiResponse,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification
    } as ApiResponse)

  } catch (error) {
    console.error('Error fetching notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification' } as ApiResponse,
      { status: 500 }
    )
  }
}

// PATCH /api/notifications/[id] - עדכון התראה (בעיקר סימון כנקרא)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = await requireDbUser(request)
    if (currentUser instanceof NextResponse) return currentUser
    const user = currentUser

    const body = await request.json()
    const { read } = body

    // בדיקה שההתראה קיימת ושייכת למשתמש
    const existingNotification = await db.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // עדכון ההתראה
    const updatedNotification = await db.notification.update({
      where: { id: params.id },
      data: { 
        read: read !== undefined ? read : true // ברירת מחדל: סימון כנקרא
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: 'Notification updated successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' } as ApiResponse,
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - מחיקת התראה
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = await requireDbUser(request)
    if (currentUser instanceof NextResponse) return currentUser
    const user = currentUser

    // בדיקה שההתראה קיימת ושייכת למשתמש
    const notification = await db.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      }
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // מחיקת ההתראה
    await db.notification.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' } as ApiResponse,
      { status: 500 }
    )
  }
}