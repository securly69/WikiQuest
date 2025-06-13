"use client"

import { useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      transports: ["websocket", "polling"],
    })

    socketRef.current = socketInstance
    setSocket(socketInstance)

    socketInstance.on("connect", () => {
      setIsConnected(true)
      console.log("Connected to server")
    })

    socketInstance.on("disconnect", () => {
      setIsConnected(false)
      console.log("Disconnected from server")
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error)
      setIsConnected(false)
    })

    return () => {
      socketInstance.disconnect()
      socketRef.current = null
    }
  }, [])

  return { socket, isConnected }
}
