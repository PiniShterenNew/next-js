// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { ApiResponse, PaginatedResponse } from '@/types'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  actionUrl?: string
  createdAt: Date
  updatedAt: Date
}

export enum NotificationType {
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_OVERDUE = 'INVOICE_OVERDUE',
  INVOICE_PAID = 'INVOICE_PAID',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  REMINDER = 'REMINDER'
}

// GET /api/notifications - קבלת כל ההתראות של המשתמש
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    // מציאת המשתמש בדאטהבייס
    const user = await db.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // קבלת פרמטרי חיפוש
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const skip = (page - 1) * limit

    // בניית query
    const whereClause = {
      userId: user.id,
      ...(unreadOnly && { read: false })
    }

    // קבלת התראות עם pagination
    const [notifications, totalCount, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({ where: whereClause }),
      db.notification.count({ 
        where: { userId: user.id, read: false } 
      })
    ])

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notifications' 
      } as ApiResponse,
      { status: 500 }
    )
  }
}

// POST /api/notifications - יצירת התראה חדשה (לשימוש פנימי)
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApiResponse,
        { status: 404 }
      )
    }

    const body = await request.json()
    const { type, title, message, data, actionUrl, targetUserId } = body

    // יצירת התראה
    const notification = await db.notification.create({
      data: {
        userId: targetUserId || user.id,
        type,
        title,
        message,
        data: data || null,
        actionUrl: actionUrl || null,
        read: false
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        data: notification,
        message: 'Notification created successfully' 
      } as ApiResponse<Notification>,
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create notification' 
      } as ApiResponse,
      { status: 500 }
    )
  }
}