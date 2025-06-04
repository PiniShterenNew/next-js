// /api/customers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { customerSchema } from '@/lib/validations'
import { ApiResponse, Customer } from '@/types'
import { NotificationService } from '@/lib/notification-service'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/customers/[id] - קבלת לקוח ספציפי
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const customer = await db.customer.findFirst({
      where: {
        id: params.id,
        userId: user.id, // וידוא שהלקוח שייך למשתמש
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10, // 10 חשבוניות אחרונות
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
            issueDate: true,
            dueDate: true,
          }
        },
        _count: {
          select: { invoices: true }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' } as ApiResponse,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: customer
    } as ApiResponse<Customer>)

  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' } as ApiResponse,
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - עדכון לקוח
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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
    const validatedData = customerSchema.parse(body)

    // בדיקה שהלקוח קיים ושייך למשתמש
    const existingCustomer = await db.customer.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // בדיקה שהמייל החדש לא זהה למייל של המשתמש המחובר
    if (validatedData.email.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot update customer with your own email address' 
        } as ApiResponse,
        { status: 400 }
      )
    }

    // בדיקה שלא קיים לקוח אחר עם אותו אימייל
    if (validatedData.email !== existingCustomer.email) {
      const emailExists = await db.customer.findFirst({
        where: {
          userId: user.id,
          email: validatedData.email,
          id: { not: params.id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Customer with this email already exists' 
          } as ApiResponse,
          { status: 409 }
        )
      }
    }

    // עדכון הלקוח
    const updatedCustomer = await db.customer.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: { invoices: true }
        }
      }
    })

    // יצירת התראה על עדכון לקוח
    try {
      await NotificationService.notifyCustomerUpdated({
        ...updatedCustomer,
        userId: user.id
      })
    } catch (error) {
      console.error('Failed to create customer update notification:', error)
    }

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
      message: 'Customer updated successfully'
    } as ApiResponse<Customer>)

  } catch (error) {
    console.error('Error updating customer:', error)
    
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
      { success: false, error: 'Failed to update customer' } as ApiResponse,
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - מחיקת לקוח
export async function DELETE(
  request: NextRequest, { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
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

    // בדיקה שהלקוח קיים ושייך למשתמש
    const customer = await db.customer.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        _count: {
          select: { invoices: true }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // בדיקה שאין חשבוניות קשורות
    if (customer._count.invoices > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete customer with existing invoices' 
        } as ApiResponse,
        { status: 409 }
      )
    }

    // מחיקת הלקוח
    await db.customer.delete({
      where: { id: id }
    })

    // יצירת התראה על מחיקת לקוח
    try {
      await NotificationService.notifyCustomerDeleted({
        ...customer,
        userId: user.id
      })
    } catch (error) {
      console.error('Failed to create customer delete notification:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' } as ApiResponse,
      { status: 500 }
    )
  }
}