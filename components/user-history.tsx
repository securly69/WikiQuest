"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { History, Clock, MapPin, Calendar, Trophy, ArrowRight } from "lucide-react"
import type { User, RaceHistory } from "@/hooks/use-auth"

interface UserHistoryProps {
  user: User
}

export function UserHistory({ user }: UserHistoryProps) {
  const [history, setHistory] = useState<RaceHistory[]>([])
  const [sortBy, setSortBy] = useState<"date" | "time" | "steps">("date")

  useEffect(() => {
    loadUserHistory()
  }, [user])

  const loadUserHistory = () => {
    const userHistory = JSON.parse(localStorage.getItem(`wikiquest_history_${user.id}`) || "[]")
    setHistory(userHistory)
  }

  const getSortedHistory = () => {
    return [...history].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        case "time":
          return a.time - b.time
        case "steps":
          return a.steps - b.steps
        default:
          return 0
      }
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStats = () => {
    if (history.length === 0) return null

    const totalQuests = history.length
    const avgSteps = Math.round(history.reduce((sum, race) => sum + race.steps, 0) / totalQuests)
    const avgTime = Math.round(history.reduce((sum, race) => sum + race.time, 0) / totalQuests)
    const bestSteps = Math.min(...history.map((race) => race.steps))
    const bestTime = Math.min(...history.map((race) => race.time))

    return { totalQuests, avgSteps, avgTime, bestSteps, bestTime }
  }

  const stats = getStats()
  const sortedHistory = getSortedHistory()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          Quest History
        </h1>
        <p className="text-xl text-gray-600">
          Welcome back, <strong>{user.username}</strong>! Here's your adventure log.
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Your Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{stats.totalQuests}</div>
                <div className="text-sm text-gray-600">Total Quests</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600">{stats.avgSteps}</div>
                <div className="text-sm text-gray-600">Avg Steps</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{formatTime(stats.avgTime)}</div>
                <div className="text-sm text-gray-600">Avg Time</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{stats.bestSteps}</div>
                <div className="text-sm text-gray-600">Best Steps</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg">
                <div className="text-3xl font-bold text-pink-600">{formatTime(stats.bestTime)}</div>
                <div className="text-sm text-gray-600">Best Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <History className="w-6 h-6 text-blue-500" />
              <span>Quest History</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant={sortBy === "date" ? "default" : "outline"} onClick={() => setSortBy("date")} size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                Date
              </Button>
              <Button variant={sortBy === "time" ? "default" : "outline"} onClick={() => setSortBy("time")} size="sm">
                <Clock className="w-4 h-4 mr-1" />
                Time
              </Button>
              <Button variant={sortBy === "steps" ? "default" : "outline"} onClick={() => setSortBy("steps")} size="sm">
                <MapPin className="w-4 h-4 mr-1" />
                Steps
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedHistory.length > 0 ? (
            <div className="space-y-4">
              {sortedHistory.map((race, index) => (
                <div
                  key={race.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 space-y-3 lg:space-y-0"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <Badge variant="outline" className="bg-emerald-50 border-emerald-200">
                        {race.startArticle}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                      <Badge variant="outline" className="bg-purple-50 border-purple-200">
                        {race.goalArticle}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Completed on {new Date(race.completedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Steps</div>
                      <div className="font-bold text-lg">{race.steps}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-bold text-lg">{formatTime(race.time)}</div>
                    </div>
                    {race.hintsUsed > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {race.hintsUsed} hints
                      </Badge>
                    )}
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Path</div>
                      <div className="text-xs text-gray-600 max-w-32 truncate">{race.path.join(" → ")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No quests completed yet</h3>
              <p className="text-gray-600 mb-4">Start your first quest to see your history here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
