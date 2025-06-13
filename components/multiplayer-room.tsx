"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, Clock, Play, ArrowLeft, Compass } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface MultiplayerRoomProps {
  roomId: string
}

interface Player {
  username: string
  id: string
}

interface RoomData {
  id: string
  creator: string
  createdAt: string
  players: Player[]
  status: "waiting" | "playing" | "finished"
  startArticle?: string
  goalArticle?: string
}

export function MultiplayerRoom({ roomId }: MultiplayerRoomProps) {
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    loadRoomData()
  }, [roomId])

  const loadRoomData = async () => {
    try {
      // Try to fetch from server first
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoomData(data)

        // Add current user if not already in room
        if (user && !data.players.some((p: Player) => p.id === user.id)) {
          await addPlayerToRoom(data)
        }
        return
      }
    } catch (error) {
      console.log("Server not available, checking localStorage")
    }

    // Fallback to localStorage
    const data = localStorage.getItem(`wikiquest_room_${roomId}`)
    if (!data) {
      setError("Room not found. The room may have expired or the code is incorrect.")
      return
    }

    try {
      const roomData: RoomData = JSON.parse(data)
      setRoomData(roomData)

      // Add current user to room if not already present
      if (user && !roomData.players.some((p) => p.id === user.id)) {
        roomData.players.push({ username: user.username, id: user.id })
        localStorage.setItem(`wikiquest_room_${roomId}`, JSON.stringify(roomData))
        setRoomData({ ...roomData })
      }
    } catch (error) {
      setError("Invalid room data.")
    }
  }

  const addPlayerToRoom = async (roomData: RoomData) => {
    if (!user) return

    const updatedRoom = {
      ...roomData,
      players: [...roomData.players, { username: user.username, id: user.id }],
    }

    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRoom),
      })
    } catch (error) {
      // Fallback to localStorage
      localStorage.setItem(`wikiquest_room_${roomId}`, JSON.stringify(updatedRoom))
    }

    setRoomData(updatedRoom)
  }

  const startGame = async () => {
    if (!roomData || !user) return

    // Use curated challenges for multiplayer
    const challenges = [
      { start: "World War II", goal: "Climate change" },
      { start: "Photosynthesis", goal: "Jazz music" },
      { start: "Quantum mechanics", goal: "Fashion design" },
      { start: "Ancient Egypt", goal: "Social media" },
      { start: "Leonardo da Vinci", goal: "Artificial intelligence" },
    ]

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]

    const updatedRoom = {
      ...roomData,
      status: "playing" as const,
      startArticle: randomChallenge.start,
      goalArticle: randomChallenge.goal,
    }

    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRoom),
      })
    } catch (error) {
      localStorage.setItem(`wikiquest_room_${roomId}`, JSON.stringify(updatedRoom))
    }

    setRoomData(updatedRoom)
  }

  const leaveRoom = () => {
    window.location.href = "/"
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="py-12 text-center space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-gray-800">Room Not Found</h2>
            <p className="text-gray-600">{error}</p>
            <Button onClick={leaveRoom} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="py-12 text-center space-y-4">
            <div className="text-6xl">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800">Login Required</h2>
            <p className="text-gray-600">Please login to join this room.</p>
            <Button onClick={leaveRoom} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Quest Room
        </h1>
        <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
          {roomId}
        </Badge>
      </div>

      {/* Room Status */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Room Status</span>
            </div>
            <Badge
              variant={
                roomData.status === "waiting" ? "secondary" : roomData.status === "playing" ? "default" : "outline"
              }
              className="capitalize"
            >
              {roomData.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Room Creator</span>
              </h3>
              <Badge variant="outline" className="bg-yellow-50">
                {roomData.creator}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Created</span>
              </h3>
              <p className="text-sm text-gray-600">{new Date(roomData.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Players ({roomData.players.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {roomData.players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  player.id === user.id ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                {player.username === roomData.creator && <Crown className="w-4 h-4 text-yellow-500" />}
                <span className="font-medium">{player.username}</span>
                {player.id === user.id && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      {roomData.status === "waiting" && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle>Ready to Start?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {user.username === roomData.creator
                ? "Click 'Start Quest' to begin the multiplayer challenge!"
                : "Waiting for the room creator to start the game..."}
            </p>
            <div className="flex space-x-4">
              {user.username === roomData.creator ? (
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Quest
                </Button>
              ) : (
                <Button disabled className="bg-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  Waiting for Host
                </Button>
              )}
              <Button onClick={leaveRoom} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave Room
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {roomData.status === "playing" && (
        <Card className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="py-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Quest in Progress!</h2>
            <p className="text-lg">
              Navigate from <strong>{roomData.startArticle}</strong> to <strong>{roomData.goalArticle}</strong>
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() =>
                  window.open(
                    `/solo?start=${encodeURIComponent(roomData.startArticle!)}&goal=${encodeURIComponent(roomData.goalArticle!)}`,
                  )
                }
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Compass className="w-4 h-4 mr-2" />
                Start Your Quest
              </Button>
              <Button
                onClick={leaveRoom}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave Room
              </Button>
            </div>
            <p className="text-sm opacity-90">
              Real-time multiplayer racing is coming soon! For now, compete by comparing your final results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
