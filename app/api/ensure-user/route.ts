import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let user = await db.user.findUnique({ where: { clerkId: userId } })

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId)
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
        }
      })

      await db.userSettings.create({
        data: {
          userId: user.id,
          businessName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'My Business',
          taxRate: 17,
          currency: 'ILS',
          invoicePrefix: 'INV',
          nextInvoiceNumber: 1,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error ensuring user:', error)
    return NextResponse.json({ success: false, error: 'Failed to ensure user' }, { status: 500 })
  }
}
