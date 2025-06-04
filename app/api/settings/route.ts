import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { userSettingsSchema } from '@/lib/validations'
import { ApiResponse, UserSettings } from '@/types'
import { NotificationService } from '@/lib/notification-service'

// GET /api/settings - קבלת הגדרות המשתמש
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      include: { settings: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // אם אין הגדרות, צור ברירות מחדל
    let settings = user.settings
    if (!settings) {
      settings = await db.userSettings.create({
        data: {
          userId: user.id,
          businessName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'My Business',
          businessAddress: '',
          businessPhone: '',
          businessEmail: user.email,
          taxRate: 17, // Default Israeli VAT
          currency: 'ILS',
          invoicePrefix: 'INV',
          nextInvoiceNumber: 1,
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: settings
    } as ApiResponse<UserSettings>)

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' } as ApiResponse,
      { status: 500 }
    )
  }
}

// PUT /api/settings - עדכון הגדרות המשתמש
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      include: { settings: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApiResponse,
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = userSettingsSchema.parse(body)

    // עדכון או יצירת הגדרות
    const settings = await db.userSettings.upsert({
      where: { userId: user.id },
      update: validatedData,
      create: {
        ...validatedData,
        userId: user.id,
      }
    })

    // יצירת התראה על עדכון הגדרות
    try {
      await NotificationService.notifySettingsUpdated(user.id)
    } catch (error) {
      console.error('Failed to create settings notification:', error)
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    } as ApiResponse<UserSettings>)

  } catch (error) {
    console.error('Error updating settings:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data provided',
          details: error 
        } as ApiResponse,
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update settings' } as ApiResponse,
      { status: 500 }
    )
  }
}