"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, MapPin, User, Compass, ArrowRight, Bot } from "lucide-react"
import type { User as UserType } from "@/hooks/use-auth"

interface RouteResult {
  steps: number
  time: number
  path: string[]
  hintsUsed: number
}

interface AIResult {
  steps: number
  time: number
  path: string[]
  completed: boolean
}

interface LeaderboardEntry {
  id: string
  username: string
  startArticle: string
  goalArticle: string
  steps: number
  time: number
  path: string[]
  hintsUsed: number
  completedAt: string
  score: number
}

interface RouteLeaderboardProps {
  startArticle: string
  goalArticle: string
  userResult: RouteResult
  aiResult?: AIResult
  onNewQuest: () => void
  user: UserType | null
}

export function RouteLeaderboard({
  startArticle,
  goalArticle,
  userResult,
  aiResult,
  onNewQuest,
  user,
}: RouteLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<"time" | "steps" | "score">("score")

  useEffect(() => {
    loadRouteLeaderboard()
  }, [startArticle, goalArticle])

  const loadRouteLeaderboard = () => {
    const routeKey = `${startArticle} → ${goalArticle}`
    const routeHash = routeKey
      .split("")
      .reduce((hash, char) => {
        return (hash << 5) - hash + char.charCodeAt(0)
      }, 0)
      .toString(36)

    const existingData = JSON.parse(localStorage.getItem(`wikiquest_route_${routeHash}`) || "[]")
    setLeaderboard(existingData)
  }

  const getSortedLeaderboard = () => {
    const sorted = [...leaderboard].sort((a, b) => {
      switch (activeTab) {
        case "time":
          return a.time - b.time
        case "steps":
          return a.steps - b.steps
        case "score":
        default:
          return b.score - a.score
      }
    })

    if (user) {
      const userIndex = sorted.findIndex((entry) => entry.username === user.username)
      setUserRank(userIndex + 1)
    }

    return sorted
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
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>
    }
  }

  const calculateScore = (steps: number, time: number, hintsUsed: number): number => {
    const baseScore = 1000
    const stepPenalty = steps * 10
    const timePenalty = Math.floor(time / 10)
    const hintPenalty = hintsUsed * 50
    return Math.max(0, baseScore - stepPenalty - timePenalty - hintPenalty)
  }

  const userScore = calculateScore(userResult.steps, userResult.time, userResult.hintsUsed)
  const aiScore = aiResult ? calculateScore(aiResult.steps, aiResult.time, 0) : 0
  const sortedLeaderboard = getSortedLeaderboard()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          Quest Complete!
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Badge variant="outline" className="text-lg px-4 py-2 bg-emerald-50 border-emerald-200">
            {startArticle}
          </Badge>
          <ArrowRight className="w-6 h-6 text-gray-400" />
          <Badge variant="outline" className="text-lg px-4 py-2 bg-purple-50 border-purple-200">
            {goalArticle}
          </Badge>
        </div>
      </div>

      {/* Race Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Result */}
        <Card className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <User className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Your Performance</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{userResult.steps}</div>
                  <div className="text-sm opacity-90">Steps</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatTime(userResult.time)}</div>
                  <div className="text-sm opacity-90">Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{userResult.hintsUsed}</div>
                  <div className="text-sm opacity-90">Hints</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{userScore}</div>
                  <div className="text-sm opacity-90">Score</div>
                </div>
              </div>
              {user && userRank > 0 && <div className="text-lg font-semibold">Rank: #{userRank}</div>}
            </div>
          </CardContent>
        </Card>

        {/* AI Result */}
        {aiResult && (
          <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-0 shadow-xl">
            <CardContent className="py-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Bot className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">AI Performance</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{aiResult.steps}</div>
                    <div className="text-sm opacity-90">Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{formatTime(aiResult.time)}</div>
                    <div className="text-sm opacity-90">Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{aiScore}</div>
                    <div className="text-sm opacity-90">Score</div>
                  </div>
                  <div className="text-center">
                    <Badge variant={aiResult.completed ? "default" : "secondary"} className="bg-white/20">
                      {aiResult.completed ? "Complete" : "Incomplete"}
                    </Badge>
                  </div>
                </div>
                {aiResult.completed && (
                  <div className="text-lg font-semibold">
                    {userScore > aiScore ? "You Won!" : userScore < aiScore ? "AI Won!" : "Tie!"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Leaderboard */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Compass className="w-6 h-6 text-blue-500" />
              <span>Route Leaderboard</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === "score" ? "default" : "outline"}
                onClick={() => setActiveTab("score")}
                className={`flex items-center space-x-2 ${
                  activeTab === "score" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Best Score</span>
              </Button>
              <Button
                variant={activeTab === "time" ? "default" : "outline"}
                onClick={() => setActiveTab("time")}
                className={`flex items-center space-x-2 ${
                  activeTab === "time" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Fastest Time</span>
              </Button>
              <Button
                variant={activeTab === "steps" ? "default" : "outline"}
                onClick={() => setActiveTab("steps")}
                className={`flex items-center space-x-2 ${
                  activeTab === "steps" ? "bg-gradient-to-r from-emerald-600 to-blue-600" : ""
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Least Steps</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedLeaderboard.length > 0 ? (
            <div className="space-y-3">
              {sortedLeaderboard.slice(0, 10).map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md space-y-3 sm:space-y-0 ${
                    user && entry.username === user.username
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ring-2 ring-blue-200"
                      : index === 0
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                        : index === 1
                          ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
                          : index === 2
                            ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
                            : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {getRankIcon(index + 1)}
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        {entry.username}
                        {user && entry.username === user.username && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Score</div>
                      <div className="font-bold text-lg">{entry.score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Steps</div>
                      <div className="font-bold text-lg">{entry.steps}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-bold text-lg">{formatTime(entry.time)}</div>
                    </div>
                    {entry.hintsUsed > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {entry.hintsUsed} hints
                      </Badge>
                    )}
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Path</div>
                      <div className="text-xs text-gray-600 max-w-32 truncate" title={entry.path.join(" → ")}>
                        {entry.path.join(" → ")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Be the first to complete this route!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={onNewQuest}
          className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
          size="lg"
        >
          <Compass className="w-5 h-5 mr-2" />
          Start New Quest
        </Button>
      </div>
    </div>
  )
}
