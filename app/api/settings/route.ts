import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { userSettingsSchema } from '@/lib/validations'
import { ApiResponse, type UserSettings } from '@/types'
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

    // המרת Decimal למספר רגיל וטיפול בערכים null
    const serializedSettings: UserSettings = {
      ...settings,
      taxRate: settings.taxRate.toNumber(),
      businessName: settings.businessName || undefined,
      businessAddress: settings.businessAddress || undefined,
      businessPhone: settings.businessPhone || undefined,
      businessEmail: settings.businessEmail || undefined,
    }

    return NextResponse.json({
      success: true,
      data: serializedSettings
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

    // קבלת ההגדרות הקיימות
    const currentSettings = await db.userSettings.findUnique({
      where: { userId: user.id }
    })

    if (!currentSettings) {
      return NextResponse.json(
        { success: false, error: 'Settings not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // עדכון ההגדרות
    const updatedSettings = await db.userSettings.update({
      where: { userId: user.id },
      data: validatedData,
    })

    // מציאת השדות שהשתנו
    const updatedFields = Object.keys(validatedData).filter(
      key => JSON.stringify(validatedData[key as keyof typeof validatedData]) !== 
            JSON.stringify(currentSettings[key as keyof typeof currentSettings])
    )

    // המרת Decimal למספר רגיל וטיפול בערכים null
    const serializedUpdatedSettings: UserSettings = {
      ...updatedSettings,
      taxRate: updatedSettings.taxRate.toNumber(),
      businessName: updatedSettings.businessName || undefined,
      businessAddress: updatedSettings.businessAddress || undefined,
      businessPhone: updatedSettings.businessPhone || undefined,
      businessEmail: updatedSettings.businessEmail || undefined,
    }

    // שליחת התראה על עדכון הגדרות
    if (updatedFields.length > 0) {
      try {
        // המרת האובייקט לטיפוס הנכון
        const settingsForNotification = {
          ...serializedUpdatedSettings,
          userId: user.id
        };
        
        await NotificationService.notifySettingsUpdated(settingsForNotification, updatedFields)
        console.log(`✅ Settings update notification created for user ID: ${user.id}`)
      } catch (error) {
        console.error('❌ Failed to create settings update notification:', error)
        // לא נכשיל את הבקשה אם יצירת ההתראה נכשלה
      }
    }

    return NextResponse.json({
      success: true,
      data: serializedUpdatedSettings,
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