"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, Copy, Link, CheckCircle, Share2, User } from "lucide-react"
import type { User as UserType } from "@/hooks/use-auth"

interface MultiplayerQuestProps {
  user: UserType | null
}

export function MultiplayerQuest({ user }: MultiplayerQuestProps) {
  const [roomCode, setRoomCode] = useState("")
  const [shareableLink, setShareableLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)

  const createRoom = async () => {
    if (!user) {
      alert("Please login to create a room")
      return
    }

    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(newRoomCode)
    const link = `${window.location.origin}/room/${newRoomCode}`
    setShareableLink(link)

    // Store room data in a way that can be accessed cross-device
    const roomData = {
      id: newRoomCode,
      creator: user.username,
      createdAt: new Date().toISOString(),
      players: [{ username: user.username, id: user.id }],
      status: "waiting",
      startArticle: "",
      goalArticle: "",
    }

    try {
      // In a real implementation, this would be sent to a server
      // For now, we'll simulate cross-device functionality with a shared storage approach
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      })

      if (!response.ok) {
        // Fallback to localStorage for demo
        localStorage.setItem(`wikiquest_room_${newRoomCode}`, JSON.stringify(roomData))
      }
    } catch (error) {
      // Fallback to localStorage
      localStorage.setItem(`wikiquest_room_${newRoomCode}`, JSON.stringify(roomData))
    }
  }

  const joinRoom = async () => {
    if (!user) {
      alert("Please login to join a room")
      return
    }

    if (!roomCode) {
      alert("Please enter a room code")
      return
    }

    try {
      // Try to fetch room from server first
      const response = await fetch(`/api/rooms/${roomCode}`)
      if (response.ok) {
        window.location.href = `/room/${roomCode}`
        return
      }
    } catch (error) {
      // Fallback to localStorage check
    }

    // Check localStorage as fallback
    const roomData = localStorage.getItem(`wikiquest_room_${roomCode}`)
    if (!roomData) {
      alert("Room not found. Please check the room code or ask the room creator to share the link again.")
      return
    }

    // Navigate to room
    window.location.href = `/room/${roomCode}`
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my WikiQuest!",
          text: `Join me for a WikiQuest challenge! Room: ${roomCode}`,
          url: shareableLink,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Multiplayer Quests
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please login to create or join multiplayer rooms and challenge friends!
          </p>
        </div>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <User className="w-16 h-16 text-gray-400 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-700">Login Required</h3>
              <p className="text-gray-600">You need to be logged in to access multiplayer features.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Multiplayer Quests
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create a room, invite friends with a shareable link, and see who can navigate Wikipedia the fastest!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Room */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-emerald-700">
              <Plus className="w-5 h-5" />
              <span>Create New Quest Room</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Logged in as:</strong> {user.username}
              </p>
            </div>

            <Button
              onClick={createRoom}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quest Room
            </Button>

            {roomCode && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Room Code:</p>
                      <p className="text-2xl font-bold text-emerald-900 font-mono">{roomCode}</p>
                    </div>
                    <Button
                      onClick={copyRoomCode}
                      variant="outline"
                      size="sm"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    >
                      {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 mr-3">
                      <p className="text-sm font-medium text-blue-800 mb-1">Shareable Link:</p>
                      <p className="text-sm text-blue-700 break-all font-mono bg-white/50 p-2 rounded">
                        {shareableLink}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={copyShareableLink}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {linkCopied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 mr-1" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    {navigator.share && (
                      <Button
                        onClick={shareViaWebShare}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-100"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => (window.location.href = `/room/${roomCode}`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Enter Room
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Join Room */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <Users className="w-5 h-5" />
              <span>Join Existing Quest</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Logged in as:</strong> {user.username}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Code</label>
              <Input
                placeholder="Enter 6-character room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="font-mono text-center text-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
            </div>

            <Button
              onClick={joinRoom}
              disabled={!roomCode.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200 hover:scale-105"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Quest
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have a room code? Ask a friend to create a room and share the link with you!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
