// api/customers/route.ts - ניהול לקוחות
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { customerSchema } from '@/lib/validations'
import { ApiResponse, type Customer } from '@/types'
import { NotificationService } from '@/lib/notification-service'

// GET /api/customers - קבלת כל הלקוחות של המשתמש
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
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // בניית query עבור חיפוש
    const whereClause = {
      userId: user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ]
      })
    }

    // קבלת לקוחות עם pagination
    const [customers, totalCount] = await Promise.all([
      db.customer.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { invoices: true }
          }
        }
      }),
      db.customer.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch customers' 
      } as ApiResponse,
      { status: 500 }
    )
  }
}

// POST /api/customers - יצירת לקוח חדש
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    // Validation עם Zod
    const validatedData = customerSchema.parse(body)

    // בדיקה שהמייל לא זהה למייל של המשתמש המחובר
    if (validatedData.email.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot create customer with your own email address' 
        } as ApiResponse,
        { status: 400 }
      )
    }

    // בדיקה אם לקוח עם אימייל זה כבר קיים
    const existingCustomer = await db.customer.findFirst({
      where: {
        userId: user.id,
        email: validatedData.email
      }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Customer with this email already exists' 
        } as ApiResponse,
        { status: 409 }
      )
    }

    // יצירת לקוח חדש
    const customer = await db.customer.create({
      data: {
        userId: user.id,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        taxId: body.taxId || null,
      },
    })

    // שליחת התראה על יצירת לקוח חדש - בדיוק כמו בחשבוניות
    try {
      // המרת האובייקט לטיפוס הנכון - המרת null ל-undefined
      const customerForNotification = {
        ...customer,
        userId: user.id,
        phone: customer.phone || undefined,
        address: customer.address || undefined,
        taxId: customer.taxId || undefined
      }
      
      await NotificationService.notifyCustomerCreated(customerForNotification)
      console.log(`✅ Customer notification created for customer ID: ${customer.id}, user ID: ${user.id}`)
    } catch (error) {
      console.error('❌ Failed to create customer notification:', error)
    }

    return NextResponse.json(
      { 
        success: true, 
        data: customer,
        message: 'Customer created successfully' 
      } as ApiResponse<Customer>,
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating customer:', error)
    
    // Zod validation errors
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
      { 
        success: false, 
        error: 'Failed to create customer' 
      } as ApiResponse,
      { status: 500 }
    )
  }
}