import { db } from '@/lib/db';
import type { InvoiceItem } from '@/types';

export async function createInvoice(data: { clientName: string; items: InvoiceItem[] }) {
  return db.invoice.create({
    data: {
      clientName: data.clientName,
      items: {
        create: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });
}

// שלוף חשבוניות
export async function getInvoices() {
  return db.invoice.findMany({ include: { items: true } });
}