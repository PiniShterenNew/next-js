// app/api/socket/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// This endpoint will be used to check if the socket server is initialized
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { initialized: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // In a real implementation, you might want to check if the socket server
    // is actually running, but for simplicity we'll just return true
    // The actual socket server is initialized in server.ts
    return NextResponse.json({ initialized: true })
  } catch (error) {
    console.error('Error checking socket status:', error)
    return NextResponse.json(
      { initialized: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}