"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, Clock, Play, ArrowLeft, Trophy, User, RefreshCw } from "lucide-react"
import { QuestPlay } from "@/components/quest-play"
import { useAuth } from "@/hooks/use-auth"

interface MultiplayerRoomProps {
  roomId: string
}

interface Player {
  id: string
  username: string
  currentArticle?: string
  steps?: number
  completed?: boolean
  completionTime?: number
  path?: string[]
  lastUpdate?: number
}

interface RoomData {
  id: string
  creator: string
  createdAt: string
  players: Player[]
  status: "waiting" | "playing" | "finished"
  startArticle?: string
  goalArticle?: string
  lastUpdate: number
}

export function MultiplayerRoom({ roomId }: MultiplayerRoomProps) {
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [error, setError] = useState("")
  const [isPolling, setIsPolling] = useState(true)
  const { user } = useAuth()
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasJoinedRef = useRef(false)

  // Polling-based multiplayer system
  useEffect(() => {
    if (!user || hasJoinedRef.current) return

    hasJoinedRef.current = true
    joinRoom()

    // Start polling for updates
    pollIntervalRef.current = setInterval(() => {
      if (isPolling) {
        pollRoomUpdates()
      }
    }, 2000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [user, roomId, isPolling])

  const joinRoom = async () => {
    if (!user) return

    try {
      // Try to get existing room data
      let roomData = getRoomFromStorage()

      if (!roomData) {
        // Create new room if it doesn't exist
        roomData = {
          id: roomId,
          creator: user.username,
          createdAt: new Date().toISOString(),
          players: [],
          status: "waiting",
          lastUpdate: Date.now(),
        }
      }

      // Add current user if not already in room
      if (!roomData.players.find((p) => p.id === user.id)) {
        roomData.players.push({
          id: user.id,
          username: user.username,
          currentArticle: "",
          steps: 0,
          completed: false,
          lastUpdate: Date.now(),
        })
      }

      roomData.lastUpdate = Date.now()
      saveRoomToStorage(roomData)
      setRoomData(roomData)
    } catch (error) {
      setError("Failed to join room")
    }
  }

  const pollRoomUpdates = () => {
    const roomData = getRoomFromStorage()
    if (roomData) {
      setRoomData(roomData)
      if (roomData.status === "playing" && roomData.startArticle && roomData.goalArticle) {
        setGameStarted(true)
      }
    }
  }

  const getRoomFromStorage = (): RoomData | null => {
    try {
      const data = localStorage.getItem(`wikiquest_room_${roomId}`)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  const saveRoomToStorage = (data: RoomData) => {
    try {
      localStorage.setItem(`wikiquest_room_${roomId}`, JSON.stringify(data))
      // Also save to a global rooms index for cross-device access
      const allRooms = JSON.parse(localStorage.getItem("wikiquest_all_rooms") || "{}")
      allRooms[roomId] = {
        id: roomId,
        creator: data.creator,
        lastUpdate: data.lastUpdate,
        playerCount: data.players.length,
      }
      localStorage.setItem("wikiquest_all_rooms", JSON.stringify(allRooms))
    } catch (error) {
      console.error("Failed to save room data:", error)
    }
  }

  const startGame = () => {
    if (!roomData || !user) return

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
      lastUpdate: Date.now(),
    }

    saveRoomToStorage(updatedRoom)
    setRoomData(updatedRoom)
    setGameStarted(true)
  }

  const updatePlayerProgress = (currentArticle: string, path: string[]) => {
    if (!roomData || !user) return

    const updatedRoom = {
      ...roomData,
      players: roomData.players.map((player) =>
        player.id === user.id
          ? {
              ...player,
              currentArticle,
              steps: path.length - 1,
              path,
              lastUpdate: Date.now(),
            }
          : player,
      ),
      lastUpdate: Date.now(),
    }

    saveRoomToStorage(updatedRoom)
    setRoomData(updatedRoom)
  }

  const completeQuest = (completionTime: number, steps: number, path: string[]) => {
    if (!roomData || !user) return

    const updatedRoom = {
      ...roomData,
      players: roomData.players.map((player) =>
        player.id === user.id
          ? {
              ...player,
              completed: true,
              completionTime,
              steps,
              path,
              lastUpdate: Date.now(),
            }
          : player,
      ),
      lastUpdate: Date.now(),
    }

    saveRoomToStorage(updatedRoom)
    setRoomData(updatedRoom)
  }

  const leaveRoom = () => {
    if (roomData && user) {
      const updatedRoom = {
        ...roomData,
        players: roomData.players.filter((p) => p.id !== user.id),
        lastUpdate: Date.now(),
      }

      if (updatedRoom.players.length === 0) {
        localStorage.removeItem(`wikiquest_room_${roomId}`)
        const allRooms = JSON.parse(localStorage.getItem("wikiquest_all_rooms") || "{}")
        delete allRooms[roomId]
        localStorage.setItem("wikiquest_all_rooms", JSON.stringify(allRooms))
      } else {
        saveRoomToStorage(updatedRoom)
      }
    }

    setIsPolling(false)
    window.location.href = "/"
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="py-12 text-center space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-gray-800">Room Error</h2>
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

  if (gameStarted && roomData.startArticle && roomData.goalArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-100">
        <div className="container mx-auto px-4 py-6">
          {/* Multiplayer Progress Bar */}
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Race Progress</span>
                </div>
                <Button variant="outline" size="sm" onClick={pollRoomUpdates} className="flex items-center space-x-1">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roomData.players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      player.completed
                        ? "bg-green-50 border-green-200"
                        : player.id === user.id
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {player.username === roomData.creator && <Crown className="w-4 h-4 text-yellow-500" />}
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {player.username}
                        {player.id === user.id && " (You)"}
                      </span>
                      {player.completed && <Trophy className="w-4 h-4 text-green-600" />}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">Steps: {player.steps || 0}</div>
                      {player.currentArticle && (
                        <Badge variant="outline" className="text-xs max-w-32 truncate">
                          {player.currentArticle}
                        </Badge>
                      )}
                      {player.completed && player.completionTime && (
                        <Badge variant="default" className="bg-green-600">
                          {formatTime(player.completionTime)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <QuestPlay
            startArticle={roomData.startArticle}
            goalArticle={roomData.goalArticle}
            onBackToSetup={leaveRoom}
            mode="multiplayer"
            user={user}
            roomId={roomId}
            onProgressUpdate={updatePlayerProgress}
            onQuestComplete={completeQuest}
          />
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
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">Local Multiplayer</span>
        </div>
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Players ({roomData.players.length})</span>
            </div>
            <Button variant="outline" size="sm" onClick={pollRoomUpdates} className="flex items-center space-x-1">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {roomData.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  player.id === user.id ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                {player.username === roomData.creator && <Crown className="w-4 h-4 text-yellow-500" />}
                <User className="w-4 h-4" />
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
    </div>
  )
}
