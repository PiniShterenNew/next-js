import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // קבלת המשתמש הנוכחי מ-Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      // בדיקה אם המשתמש כבר קיים
      const existingUser = await db.user.findUnique({
        where: { clerkId: user.id }
      })

      if (existingUser) {
        return NextResponse.json({
          user: existingUser,
          isNew: false
        })
      }

      // יצירת משתמש חדש אם לא קיים
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      
      const newUser = await db.user.create({
        data: {
          clerkId: user.id,
          email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          imageUrl: user.imageUrl || '',
        }
      })

      return NextResponse.json({
        user: newUser,
        isNew: true
      })
    } catch (error) {
      console.error('Error in user sync:', error)
      return NextResponse.json(
        { error: 'Failed to find or create user' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json(
      { error: 'Failed to get current user' },
      { status: 500 }
    )
  }
}
