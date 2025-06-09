// lib/socket-server.ts
import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { db } from '@/lib/db'

let io: SocketIOServer | null = null

export const initSocketServer = (httpServer: HttpServer) => {
  if (io) return io

  // Create Socket.IO server with CORS configuration
  io = new SocketIOServer(httpServer, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId
    if (!userId) {
      return next(new Error('Authentication error'))
    }
    
    // Store userId in socket data for later use
    socket.data.userId = userId
    next()
  })

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // Handle authentication event
    socket.on('authenticate', async (userId) => {
      if (!userId) {
        socket.emit('authentication_error', { message: 'User ID is required' })
        return
      }

      try {
        // Verify user exists in database
        const user = await db.user.findFirst({
          where: { clerkId: userId }
        })

        if (!user) {
          socket.emit('authentication_error', { message: 'User not found' })
          return
        }

        // Join user to their private room
        socket.join(`user:${userId}`)
        socket.data.userId = userId
        socket.data.authenticated = true

        // Confirm authentication
        socket.emit('authenticated', { userId, socketId: socket.id })
        console.log(`User ${userId} authenticated on socket ${socket.id}`)
      } catch (error) {
        console.error('Authentication error:', error)
        socket.emit('authentication_error', { message: 'Authentication failed' })
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  console.log('Socket.IO server initialized')
  return io
}

// Get the socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Please call initSocketServer first.')
  }
  return io
}