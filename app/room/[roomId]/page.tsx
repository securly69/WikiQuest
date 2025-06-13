"use client"

import { useParams } from "next/navigation"
import { MultiplayerRoom } from "@/components/multiplayer-room"

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-100">
      <MultiplayerRoom roomId={roomId} />
    </div>
  )
}
