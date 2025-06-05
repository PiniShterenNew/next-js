// app/api/invoices/route.ts - תיקון והוספת התראות
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { requireDbUser } from '@/lib/auth-utils'
import { invoiceSchema } from '@/lib/validations'
import { ApiResponse, Invoice, InvoiceStatus } from '@/types'
import { generateInvoiceNumber, calculateInvoiceTotal } from '@/lib/utils'
import { NotificationService } from '@/lib/notification-service'

// GET /api/invoices - קבלת כל החשבוניות של המשתמש
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireDbUser(request)
    if (currentUser instanceof NextResponse) return currentUser
    const user = currentUser

    // קבלת פרמטרי חיפוש וסינון
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // בניית query עבור חיפוש וסינון
    const whereClause: any = {
      userId: user.id,
    }

    // חיפוש לפי מספר חשבונית או שם לקוח
    if (search) {
      whereClause.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    // סינון לפי סטטוס
    if (status && status !== 'all') {
      const statusArray = status.split(',').filter(s =>
        Object.values(InvoiceStatus).includes(s as InvoiceStatus)
      )
      if (statusArray.length > 0) {
        whereClause.status = { in: statusArray }
      }
    }

    // סינון לפי לקוח
    if (customerId) {
      whereClause.customerId = customerId
    }

    // קבלת חשבוניות עם pagination
    const [invoices, totalCount] = await Promise.all([
      db.invoice.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          items: true,
          _count: {
            select: { items: true }
          }
        }
      }),
      db.invoice.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch invoices'
      } as ApiResponse,
      { status: 500 }
    )
  }
}

// POST /api/invoices - יצירת חשבונית חדשה
export async function POST(request: NextRequest) {
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

    if (typeof body.dueDate === 'string') {
      body.dueDate = new Date(body.dueDate)
    }

    // Validation עם Zod
    const validatedData = invoiceSchema.parse(body)

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

    // קבלת הגדרות המשתמש או יצירת ברירת מחדל
    let settings = user.settings
    if (!settings) {
      settings = await db.userSettings.create({
        data: {
          userId: user.id,
          businessName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'My Business',
          taxRate: 17,
          currency: 'ILS',
          invoicePrefix: 'INV',
          nextInvoiceNumber: 1,
        }
      })
    }

    // חישוב סכומים
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice), 0
    )

    const totals = calculateInvoiceTotal(
      subtotal,
      Number(settings.taxRate),
      validatedData.discount || 0
    )

    // יצירת מספר חשבונית
    const invoiceNumber = generateInvoiceNumber(
      settings.invoicePrefix,
      settings.nextInvoiceNumber
    )

    // יצירת חשבונית במסד הנתונים
    const invoice = await db.$transaction(async (tx) => {
      // יצירת החשבונית
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          userId: user.id,
          customerId: validatedData.customerId,
          dueDate: validatedData.dueDate,
          notes: validatedData.notes,
          subtotal: totals.subtotal,
          tax: totals.tax,
          discount: totals.discount,
          total: totals.total,
          status: 'DRAFT' as const,
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

      // עדכון מספר החשבונית הבא בהגדרות
      await tx.userSettings.update({
        where: { id: settings.id },
        data: { nextInvoiceNumber: settings.nextInvoiceNumber + 1 }
      })

      return newInvoice
    })

    // שליחת התראה על יצירת חשבונית חדשה
    await NotificationService.notifyInvoiceCreated({
      ...invoice,
      userId: user.id
    })

    // המרת שדות מספריים
    const invoiceWithNumericFields = {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      discount: Number(invoice.discount),
      total: Number(invoice.total),
      status: invoice.status as unknown as InvoiceStatus, // המרת הטיפוס
    }

    // יצירת אובייקט תגובה עם הטיפוס הנכון
    const responseData: Invoice = {
      ...invoiceWithNumericFields,
      notes: invoice.notes || undefined,
      customer: {
        id: customer.id,
        userId: user.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || undefined,
        address: customer.address || undefined,
        taxId: customer.taxId || undefined,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      },
      items: invoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: 'Invoice created successfully'
      } as ApiResponse<Invoice>,
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating invoice:', error)

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
        error: 'Failed to create invoice'
      } as ApiResponse,
      { status: 500 }
    )
  }
}