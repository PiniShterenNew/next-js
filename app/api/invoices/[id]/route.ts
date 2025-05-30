import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { invoiceSchema } from '@/lib/validations'
import { ApiResponse, Invoice, InvoiceStatus } from '@/types'
import { calculateInvoiceTotal } from '@/lib/utils'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/invoices/[id] - קבלת חשבונית ספציפית
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

    const invoice = await db.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.id, // וידוא שהחשבונית שייכת למשתמש
      },
      include: {
        customer: true,
        items: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          include: { settings: true }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' } as ApiResponse,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoice
    } as ApiResponse<Invoice>)

  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice' } as ApiResponse,
      { status: 500 }
    )
  }
}

// PUT /api/invoices/[id] - עדכון חשבונית
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
    const validatedData = invoiceSchema.parse(body)

    // בדיקה שהחשבונית קיימת ושייכת למשתמש
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: { items: true }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // בדיקה שניתן לערוך (רק טיוטות)
    if (existingInvoice.status !== InvoiceStatus.DRAFT) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Only draft invoices can be edited' 
        } as ApiResponse,
        { status: 400 }
      )
    }

    // בדיקה שהלקוח שייך למשתמש
    const customer = await db.customer.findFirst({
      where: {
        id: validatedData.customerId,
        userId: user.id
      }
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // חישוב סכומים מחדש
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice), 0
    )
    
    const totals = calculateInvoiceTotal(
      subtotal, 
      Number(user.settings?.taxRate || 17), 
      validatedData.discount || 0
    )

    // עדכון החשבונית במסד הנתונים
    const updatedInvoice = await db.$transaction(async (tx) => {
      // מחיקת פריטים קיימים
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: params.id }
      })

      // עדכון החשבונית עם פריטים חדשים
      const invoice = await tx.invoice.update({
        where: { id: params.id },
        data: {
          customerId: validatedData.customerId,
          dueDate: validatedData.dueDate,
          notes: validatedData.notes,
          subtotal: totals.subtotal,
          tax: totals.tax,
          discount: totals.discount,
          total: totals.total,
          items: {
            create: validatedData.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            }))
          }
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

      return invoice
    })

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully'
    } as ApiResponse<Invoice>)

  } catch (error) {
    console.error('Error updating invoice:', error)
    
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
      { success: false, error: 'Failed to update invoice' } as ApiResponse,
      { status: 500 }
    )
  }
}

// DELETE /api/invoices/[id] - מחיקת חשבונית
export async function DELETE(
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

    // בדיקה שהחשבונית קיימת ושייכת למשתמש
    const invoice = await db.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // בדיקה שניתן למחוק (רק טיוטות)
    if (invoice.status !== InvoiceStatus.DRAFT) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Only draft invoices can be deleted' 
        } as ApiResponse,
        { status: 400 }
      )
    }

    // מחיקת החשבונית (הפריטים יימחקו אוטומטית בגלל CASCADE)
    await db.invoice.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice' } as ApiResponse,
      { status: 500 }
    )
  }
}