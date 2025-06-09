'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@clerk/nextjs'

export type UseSocketReturn = {
  socket: Socket | null
  connected: boolean
  error: Error | null
  reconnect: () => Promise<void>
}

/**
 * Custom hook to manage socket.io connection
 * Automatically connects when user is authenticated
 * Handles reconnection and emits authentication events
 */
export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null)
  const { userId } = useAuth()

  // Initialize socket connection
  const socketInit = useCallback(async () => {
    try {
      // Don't create multiple connections
      if (socket?.connected) {
        return
      }

      // Make sure the socket server is initialized by calling our API endpoint
      const response = await fetch('/api/socket')
      const data = await response.json()
      
      if (!data.initialized) {
        console.warn('⚠️ Socket server not initialized yet')
      }

      // Create socket connection with the correct path
      const socketInstance = io({
        path: '/api/socketio', // Match server path
        addTrailingSlash: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000
      })

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('🔌 Socket connected:', socketInstance.id)
        setConnected(true)
        setError(null)
        
        // Send authentication event if we have a userId
        if (userId) {
          socketInstance.emit('authenticate', userId)
        }
      })

      socketInstance.on('authenticated', (data) => {
        console.log('🔑 Socket authenticated for user:', data.userId)
        setAuthenticatedUser(data.userId)
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason)
        setConnected(false)
      })

      socketInstance.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message)
        setError(err)
        setConnected(false)
      })

      socketInstance.io.on('reconnect', (attempt) => {
        console.log(`🔄 Socket reconnected after ${attempt} attempts`)
      })

      socketInstance.io.on('reconnect_error', (err) => {
        console.error('❌ Socket reconnection error:', err.message)
      })

      // Save socket instance
      setSocket(socketInstance)

      // Clean up on unmount
      return () => {
        console.log('🧹 Cleaning up socket connection')
        socketInstance.disconnect()
        setSocket(null)
        setConnected(false)
        setAuthenticatedUser(null)
      }
    } catch (err) {
      console.error('❌ Failed to initialize socket:', err)
      setError(err as Error)
      return undefined
    }
  }, [socket, userId])

  // Connect when component mounts and user is authenticated
  useEffect(() => {
    // Don't connect if user is not authenticated
    if (!userId) return
    
    // Initialize socket
    const cleanup = socketInit()
    
    // Clean up on unmount
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [userId, socketInit])

  // Re-authenticate when userId changes
  useEffect(() => {
    if (socket && connected && userId && userId !== authenticatedUser) {
      console.log('🔄 Re-authenticating user', userId)
      socket.emit('authenticate', userId)
    }
  }, [socket, connected, userId, authenticatedUser])

  // Manual reconnect function
  const reconnect = useCallback(async () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
    await socketInit()
  }, [socket, socketInit])

  return {
    socket,
    connected,
    error,
    reconnect
  }
}
