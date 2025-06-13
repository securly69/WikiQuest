"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Medal, Award, Compass, Search } from "lucide-react"

interface LeaderboardEntry {
  id: string
  playerName: string
  startArticle: string
  goalArticle: string
  steps: number
  time: number
  score: number
  date: string
  hintsUsed: number
}

export function Leaderboards() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([])
  const [routeLeaderboard, setRouteLeaderboard] = useState<LeaderboardEntry[]>([])
  const [selectedRoute, setSelectedRoute] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"global" | "routes">("global")

  useEffect(() => {
    fetchGlobalLeaderboard()
  }, [])

  useEffect(() => {
    if (selectedRoute) {
      fetchRouteLeaderboard(selectedRoute)
    }
  }, [selectedRoute])

  const fetchGlobalLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard/global")
      const data = await response.json()
      setGlobalLeaderboard(data)
    } catch (error) {
      console.error("Error fetching global leaderboard:", error)
      // Mock data for demonstration
      setGlobalLeaderboard([
        {
          id: "1",
          playerName: "QuestMaster",
          startArticle: "Adolf Hitler",
          goalArticle: "Ice cream",
          steps: 4,
          time: 127,
          score: 850,
          date: "2024-01-15",
          hintsUsed: 0,
        },
        {
          id: "2",
          playerName: "WikiExplorer",
          startArticle: "Philosophy",
          goalArticle: "Bacon",
          steps: 6,
          time: 203,
          score: 720,
          date: "2024-01-14",
          hintsUsed: 1,
        },
        {
          id: "3",
          playerName: "PathFinder",
          startArticle: "Mathematics",
          goalArticle: "Love",
          steps: 5,
          time: 156,
          score: 780,
          date: "2024-01-13",
          hintsUsed: 0,
        },
      ])
    }
  }

  const fetchRouteLeaderboard = async (route: string) => {
    try {
      const response = await fetch(`/api/leaderboard/route?route=${encodeURIComponent(route)}`)
      const data = await response.json()
      setRouteLeaderboard(data)
    } catch (error) {
      console.error("Error fetching route leaderboard:", error)
      // Mock data for demonstration
      setRouteLeaderboard([
        {
          id: "1",
          playerName: "RouteExpert",
          startArticle: route.split(" → ")[0],
          goalArticle: route.split(" → ")[1],
          steps: 3,
          time: 89,
          score: 920,
          date: "2024-01-15",
          hintsUsed: 0,
        },
      ])
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>
    }
  }

  const popularRoutes = [
    "Adolf Hitler → Ice cream",
    "Philosophy → Bacon",
    "Mathematics → Love",
    "Jesus → Napoleon",
    "Space → Ocean",
    "Music → War",
  ]

  const filteredRoutes = popularRoutes.filter((route) => route.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          Quest Leaderboards
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          See how you stack up against the best WikiQuest navigators in the world
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={activeTab === "global" ? "default" : "outline"}
          onClick={() => setActiveTab("global")}
          className={`transition-all duration-200 ${activeTab === "global" ? "bg-gradient-to-r from-purple-600 to-pink-600 scale-105" : "hover:scale-105"}`}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Global Rankings
        </Button>
        <Button
          variant={activeTab === "routes" ? "default" : "outline"}
          onClick={() => setActiveTab("routes")}
          className={`transition-all duration-200 ${activeTab === "routes" ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-105" : "hover:scale-105"}`}
        >
          <Compass className="w-4 h-4 mr-2" />
          Route Specific
        </Button>
      </div>

      {activeTab === "global" && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Global Leaderboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {globalLeaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                      : index === 1
                        ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
                        : index === 2
                          ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
                          : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                    {getRankIcon(index + 1)}
                    <div>
                      <div className="font-semibold text-gray-900">{entry.playerName}</div>
                      <div className="text-sm text-gray-600">
                        {entry.startArticle} → {entry.goalArticle}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Score</div>
                      <div className="font-bold text-lg">{entry.score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Steps</div>
                      <div className="font-semibold">{entry.steps}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-semibold">{formatTime(entry.time)}</div>
                    </div>
                    {entry.hintsUsed > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {entry.hintsUsed} hints
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "routes" && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Route Selection */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Select Quest Route</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredRoutes.map((route, index) => (
                  <Button
                    key={index}
                    variant={selectedRoute === route ? "default" : "outline"}
                    onClick={() => setSelectedRoute(route)}
                    className={`w-full justify-start text-left transition-all duration-200 ${
                      selectedRoute === route ? "scale-105" : "hover:scale-105"
                    }`}
                  >
                    {route}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Route Leaderboard */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Compass className="w-5 h-5" />
                <span>Route Rankings</span>
              </CardTitle>
              {selectedRoute && <p className="text-sm text-gray-600">{selectedRoute}</p>}
            </CardHeader>
            <CardContent>
              {selectedRoute ? (
                <div className="space-y-3">
                  {routeLeaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200 transition-all duration-200 hover:shadow-md space-y-2 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-3">
                        {getRankIcon(index + 1)}
                        <div className="font-semibold text-gray-900">{entry.playerName}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Score</div>
                          <div className="font-bold">{entry.score}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Steps</div>
                          <div className="font-semibold">{entry.steps}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Time</div>
                          <div className="font-semibold">{formatTime(entry.time)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">Select a route to view its leaderboard</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
