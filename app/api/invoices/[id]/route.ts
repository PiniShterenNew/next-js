import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { requireDbUser } from '@/lib/auth-utils'
import { invoiceSchema, updateInvoiceSchema } from '@/lib/validations' // ✅ import שני schemas
import { ApiResponse, Invoice, InvoiceStatus } from '@/types'
import { calculateInvoiceTotal } from '@/lib/utils'
import { NotificationService } from '@/lib/notification-service'

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
    const currentUser = await requireDbUser(request)
    if (currentUser instanceof NextResponse) return currentUser
    const user = currentUser

    const resolvedParams = await params
    const invoice = await db.invoice.findFirst({
      where: {
        id: resolvedParams.id,
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

    // המרת שדות Decimal למספרים
    const formattedInvoice = {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      discount: Number(invoice.discount),
      total: Number(invoice.total),
      items: invoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }

    return NextResponse.json({
      success: true,
      data: formattedInvoice
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
    const currentUser = await requireDbUser(request)
    if (currentUser instanceof NextResponse) return currentUser
    const user = await db.user.findUnique({
      where: { id: currentUser.id },
      include: { settings: true }
    })
    if (!user) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    const body = await request.json()
    
    // ✅ המרת התאריך מ-string ל-Date לפני הvalidation
    const processedData = {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined
    }

    // ✅ שימוש ב-updateInvoiceSchema במקום invoiceSchema
    const validatedData = updateInvoiceSchema.parse(processedData)

    const resolvedParams = await params

    // בדיקה שהחשבונית קיימת ושייכת למשתמש
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: resolvedParams.id,
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
        where: { invoiceId: resolvedParams.id }
      })

      // עדכון החשבונית עם פריטים חדשים
      const invoice = await tx.invoice.update({
        where: { id: resolvedParams.id },
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

    // שליחת התראה על עדכון חשבונית
    try {
      // זיהוי השדות שעודכנו
      const updatedFields = Object.keys(validatedData).filter(key => {
        if (key === 'items') return true // תמיד נחשב את הפריטים כמעודכנים
        // בדיקה בטוחה של השדות
        return key in existingInvoice && validatedData[key as keyof typeof validatedData] !== (existingInvoice as any)[key]
      })

      await NotificationService.notifyInvoiceUpdated({
        ...updatedInvoice,
        userId: user.id
      }, updatedFields)
    } catch (error) {
      console.error('Failed to send invoice update notification:', error)
      // לא נכשיל את כל הבקשה אם שליחת ההתראה נכשלה
    }

    // המרת שדות Decimal למספרים
    const formattedInvoice = {
      ...updatedInvoice,
      subtotal: Number(updatedInvoice.subtotal),
      tax: Number(updatedInvoice.tax),
      discount: Number(updatedInvoice.discount),
      total: Number(updatedInvoice.total),
      items: updatedInvoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }

    return NextResponse.json({
      success: true,
      data: formattedInvoice,
      message: 'Invoice updated successfully'
    } as ApiResponse<Invoice>)

  } catch (error) {
    console.error('Error updating invoice:', error)
    
    // טיפול משופר בשגיאות Zod
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      const zodError = error as any
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data provided',
          details: zodError.issues?.map((issue: any) => ({
            field: issue.path?.join('.'),
            message: issue.message,
            code: issue.code
          }))
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
    const currentUser = await requireDbUser(request)
    if (currentUser instanceof NextResponse) return currentUser
    const user = currentUser

    const resolvedParams = await params

    // בדיקה שהחשבונית קיימת ושייכת למשתמש
    const invoice = await db.invoice.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
      include: {
        customer: true // כולל פרטי לקוח לצורך ההתראה
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
      where: { id: resolvedParams.id }
    })
    
    // שליחת התראה על מחיקת חשבונית
    try {
      await NotificationService.notifyInvoiceDeleted({
        ...invoice,
        userId: user.id,
        customer: invoice.customer || { name: 'לקוח' } // במקרה שאין מידע על הלקוח
      })
    } catch (error) {
      console.error('Failed to send invoice deletion notification:', error)
      // לא נכשיל את כל הבקשה אם שליחת ההתראה נכשלה
    }

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