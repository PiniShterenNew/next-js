import { NotificationService } from '../notification-service'
import { NotificationType } from '@/types'
import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  db: {
    notification: {
      create: jest.fn(),
      deleteMany: jest.fn()
    },
    invoice: {
      findMany: jest.fn(),
      update: jest.fn()
    }
  }
}))

const mockedDb = db as jest.Mocked<typeof db>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('NotificationService', () => {
  it('notifyInvoiceCreated', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)

    const invoice = {
      id: 'inv1',
      userId: 'user1',
      invoiceNumber: 'INV-001',
      customer: { name: 'Alice' },
      total: '100'
    }

    await NotificationService.notifyInvoiceCreated(invoice as any)

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user1',
        type: NotificationType.INVOICE_CREATED,
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    )
  })

  it('notifyInvoiceUpdated', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)
    const invoice = {
      id: 'inv2',
      userId: 'user1',
      invoiceNumber: 'INV-002'
    }
    const fields = ['amount']

    await NotificationService.notifyInvoiceUpdated(invoice as any, fields)

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.INVOICE_UPDATED,
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    )
  })

  it('notifyInvoiceDeleted', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)
    const invoice = {
      id: 'inv3',
      userId: 'user1',
      invoiceNumber: 'INV-003',
      customer: { name: 'Bob' }
    }

    await NotificationService.notifyInvoiceDeleted(invoice as any)

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.INVOICE_DELETED,
        actionUrl: undefined
      })
    )
  })

  it('notifyInvoicePaid', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)
    const invoice = {
      id: 'inv4',
      userId: 'user1',
      invoiceNumber: 'INV-004',
      customer: { name: 'Bob' },
      total: '150'
    }

    await NotificationService.notifyInvoicePaid(invoice as any)

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.INVOICE_PAID,
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    )
  })

  it('notifyInvoiceOverdue', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)
    const invoice = {
      id: 'inv5',
      userId: 'user1',
      invoiceNumber: 'INV-005',
      customer: { name: 'Bob' },
      dueDate: new Date('2024-01-01'),
      total: '100'
    }

    await NotificationService.notifyInvoiceOverdue(invoice as any)

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.INVOICE_OVERDUE,
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    )
  })

  it('notifyInvoiceReminder', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)
    const invoice = {
      id: 'inv6',
      userId: 'user1',
      invoiceNumber: 'INV-006',
      customer: { name: 'Bob' },
      dueDate: new Date('2024-01-05'),
      total: '80'
    }

    await NotificationService.notifyInvoiceReminder(invoice as any, 3)

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.REMINDER,
        actionUrl: `/dashboard/invoices/${invoice.id}`
      })
    )
  })

  it('notifyCustomerCreated', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)
    const customer = {
      id: 'c1',
      userId: 'user1',
      name: 'Alice',
      email: 'a@example.com'
    }

    await NotificationService.notifyCustomerCreated(customer as any)

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.CUSTOMER_CREATED,
        actionUrl: `/dashboard/customers/${customer.id}`
      })
    )
  })

  it('notifyCustomerUpdated', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)
    const customer = {
      id: 'c2',
      userId: 'user1',
      name: 'Alice',
      email: 'a@example.com'
    }

    await NotificationService.notifyCustomerUpdated(customer as any, ['name'])

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.CUSTOMER_UPDATED,
        actionUrl: `/dashboard/customers/${customer.id}`
      })
    )
  })

  it('notifyCustomerDeleted', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)
    const customer = {
      id: 'c3',
      userId: 'user1',
      name: 'Alice',
      email: 'a@example.com'
    }

    await NotificationService.notifyCustomerDeleted(customer as any)

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.CUSTOMER_DELETED
      })
    )
  })

  it('notifySettingsUpdated', async () => {
    const spy = jest
      .spyOn(NotificationService, 'createNotification')
      .mockResolvedValue({} as any)
    const settings = {
      userId: 'user1'
    }

    await NotificationService.notifySettingsUpdated(settings as any, ['theme'])

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.SETTINGS_UPDATED,
        actionUrl: '/dashboard/settings'
      })
    )
  })
})
