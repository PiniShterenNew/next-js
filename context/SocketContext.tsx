// context/SocketContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSocket } from '@/hooks/use-socket'
import { useUser } from '@clerk/nextjs'

interface SocketContextType {
  connected: boolean
  reconnect: () => Promise<void>
  error: Error | null
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { socket, connected, error, reconnect } = useSocket()
  const { isSignedIn, user } = useUser()
  const [initialized, setInitialized] = useState(false)

  // Initialize socket when user is signed in
  useEffect(() => {
    if (isSignedIn && user && !initialized) {
      setInitialized(true)
    }
  }, [isSignedIn, user, initialized])

  return (
    <SocketContext.Provider value={{ connected, reconnect, error }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}