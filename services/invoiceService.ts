import { prisma } from '@/lib/prisma';
import type { InvoiceItem } from '@/types';

export async function createInvoice(data: { clientName: string, items: InvoiceItem[] }) {
  return prisma.invoice.create({
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

// שלוף קבלות
export async function getInvoices() {
  return prisma.invoice.findMany({ include: { items: true } });
}