// app/api/invoices/[id]/status/route.ts - תיקון והוספת התראות
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { ApiResponse, InvoiceStatus } from '@/types'
import { NotificationService } from '@/lib/notification-service'

interface RouteParams {
  params: {
    id: string
  }
}

const statusUpdateSchema = z.object({
  status: z.enum([
    InvoiceStatus.DRAFT,
    InvoiceStatus.SENT,
    InvoiceStatus.PAID,
    InvoiceStatus.OVERDUE,
    InvoiceStatus.CANCELLED
  ])
})

// PATCH /api/invoices/[id]/status - עדכון סטטוס חשבונית
export async function PATCH(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
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
    const validatedData = statusUpdateSchema.parse(body)

    // בדיקה שהחשבונית קיימת ושייכת למשתמש
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // בדיקות לוגיקה עסקית עבור שינויי סטטוס
    const currentStatus = existingInvoice.status
    const newStatus = validatedData.status

    // אסור לשנות חשבונית ששולמה או בוטלה
    if (currentStatus === InvoiceStatus.PAID || currentStatus === InvoiceStatus.CANCELLED) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot change status of ${currentStatus.toLowerCase()} invoice` 
        } as ApiResponse,
        { status: 400 }
      )
    }

    // אסור לחזור לטיוטה אחרי שנשלחה
    if (newStatus === InvoiceStatus.DRAFT && currentStatus !== InvoiceStatus.DRAFT) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot revert invoice back to draft status' 
        } as ApiResponse,
        { status: 400 }
      )
    } 

    // עדכון הסטטוס
    const updatedInvoice = await db.invoice.update({
      where: { id: id },
      data: { 
        status: newStatus,
        // אם החשבונית נשלחה לראשונה, עדכן את תאריך השליחה
        ...(newStatus === InvoiceStatus.SENT && currentStatus === InvoiceStatus.DRAFT && {
          issueDate: new Date()
        })
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: true,
      }
    })

    // יצירת התראות לפי הסטטוס החדש
    try {
      if (newStatus === InvoiceStatus.PAID && currentStatus !== InvoiceStatus.PAID) {
        await NotificationService.notifyInvoicePaid({
          ...updatedInvoice,
          userId: user.id
        })
      } else if (newStatus === InvoiceStatus.OVERDUE && currentStatus !== InvoiceStatus.OVERDUE) {
        await NotificationService.notifyInvoiceOverdue({
          ...updatedInvoice,
          userId: user.id
        })
      }
    } catch (error) {
      console.error('Failed to create status notification:', error)
      // ממשיכים גם אם יצירת ההתראה נכשלה
    }

    // הודעה מותאמת לפי הסטטוס החדש
    const statusMessages = {
      [InvoiceStatus.DRAFT]: 'Invoice saved as draft',
      [InvoiceStatus.SENT]: 'Invoice sent successfully',
      [InvoiceStatus.PAID]: 'Invoice marked as paid',
      [InvoiceStatus.OVERDUE]: 'Invoice marked as overdue',
      [InvoiceStatus.CANCELLED]: 'Invoice cancelled',
    }

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: statusMessages[newStatus]
    } as ApiResponse)

  } catch (error) {
    console.error('Error updating invoice status:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status provided',
          details: error 
        } as ApiResponse,
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update invoice status' } as ApiResponse,
      { status: 500 }
    )
  }
}