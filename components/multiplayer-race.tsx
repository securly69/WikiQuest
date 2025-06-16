"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Share2, Clock, Copy } from "lucide-react"

export function MultiplayerRace() {
  const [roomCode, setRoomCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  const createRoom = () => {
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(newRoomCode)
    setIsCreatingRoom(false)
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Race Your Friends
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create a room, invite friends, and see who can navigate Wikipedia the fastest!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create Room */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Plus className="w-5 h-5" />
              <span>Create New Room</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <Input
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <Button
              onClick={createRoom}
              disabled={!playerName.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              Create Room
            </Button>

            {roomCode && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Room Code:</p>
                    <p className="text-2xl font-bold text-green-900 font-mono">{roomCode}</p>
                  </div>
                  <Button
                    onClick={copyRoomCode}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-green-600 mt-2">Share this code with your friends!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Join Room */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <Users className="w-5 h-5" />
              <span>Join Existing Room</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <Input
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Code</label>
              <Input
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="font-mono text-center text-lg"
              />
            </div>

            <Button
              disabled={!playerName.trim() || !roomCode.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Join Room
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Match */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-700">
            <Share2 className="w-5 h-5" />
            <span>Quick Match</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">Get matched with random players for instant racing action!</p>
            <Button
              disabled={!playerName.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Find Match
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Rooms */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Active Rooms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { code: "ABC123", players: 3, maxPlayers: 4, challenge: "Einstein → Pizza" },
              { code: "XYZ789", players: 2, maxPlayers: 6, challenge: "Philosophy → Bacon" },
              { code: "DEF456", players: 1, maxPlayers: 2, challenge: "Random Challenge" },
            ].map((room) => (
              <div key={room.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="font-mono">
                    {room.code}
                  </Badge>
                  <span className="text-sm text-gray-600">{room.challenge}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">
                    {room.players}/{room.maxPlayers}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
