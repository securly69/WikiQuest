"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Clock, Compass, Trophy, Lightbulb } from "lucide-react"
import { WikipediaViewer } from "@/components/wikipedia-viewer"
import { NavigationPath } from "@/components/navigation-path"
import { HintSystem } from "@/components/hint-system"
import { RouteLeaderboard } from "@/components/route-leaderboard"
import { useAuth } from "@/hooks/use-auth"
import type { User as UserType } from "@/hooks/use-auth"

interface QuestPlayProps {
  startArticle: string
  goalArticle: string
  onBackToSetup: () => void
  mode: "solo" | "multiplayer"
  user: UserType | null
  roomId?: string
  onProgressUpdate?: (currentArticle: string, path: string[]) => void
  onQuestComplete?: (completionTime: number, steps: number, path: string[]) => void
}

export function QuestPlay({
  startArticle,
  goalArticle,
  onBackToSetup,
  mode,
  user,
  roomId,
  onProgressUpdate,
  onQuestComplete,
}: QuestPlayProps) {
  const [currentArticle, setCurrentArticle] = useState(startArticle)
  const [navigationPath, setNavigationPath] = useState<string[]>([startArticle])
  const [isGoalReached, setIsGoalReached] = useState(false)
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const { saveRaceHistory } = useAuth()
  const hasCompletedRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize start time
  useEffect(() => {
    setStartTime(new Date())
    hasCompletedRef.current = false
  }, [startArticle, goalArticle])

  // Timer effect
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      if (!hasCompletedRef.current) {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
      }
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [startTime])

  // Goal completion handler
  const handleGoalReached = useCallback(() => {
    if (hasCompletedRef.current) return

    hasCompletedRef.current = true
    setIsGoalReached(true)

    // Clear timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const finalTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)

    // Save race history for logged-in users in solo mode
    if (user && mode === "solo") {
      const raceData = {
        startArticle,
        goalArticle,
        steps: navigationPath.length - 1,
        time: finalTime,
        hintsUsed,
        path: navigationPath,
      }

      // Use requestAnimationFrame to avoid render conflicts
      requestAnimationFrame(() => {
        saveRaceHistory(raceData)
      })
    }

    // Notify multiplayer room of completion
    if (mode === "multiplayer" && onQuestComplete) {
      onQuestComplete(finalTime, navigationPath.length - 1, navigationPath)
    }

    // Show leaderboard after delay (only for solo mode)
    if (mode === "solo") {
      setTimeout(() => {
        setShowLeaderboard(true)
      }, 2000)
    }
  }, [user, mode, saveRaceHistory, startArticle, goalArticle, navigationPath, hintsUsed, startTime, onQuestComplete])

  // Check for goal completion
  useEffect(() => {
    if (currentArticle.toLowerCase() === goalArticle.toLowerCase() && !hasCompletedRef.current) {
      handleGoalReached()
    }
  }, [currentArticle, goalArticle, handleGoalReached])

  const handleArticleChange = (newArticle: string) => {
    if (hasCompletedRef.current) return

    const newPath = [...navigationPath, newArticle]
    setCurrentArticle(newArticle)
    setNavigationPath(newPath)

    // Update multiplayer progress
    if (mode === "multiplayer" && onProgressUpdate) {
      onProgressUpdate(newArticle, newPath)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const calculateScore = () => {
    const baseScore = 1000
    const stepPenalty = (navigationPath.length - 1) * 10
    const timePenalty = Math.floor(elapsedTime / 10)
    const hintPenalty = hintsUsed * 50
    return Math.max(0, baseScore - stepPenalty - timePenalty - hintPenalty)
  }

  if (showLeaderboard && mode === "solo") {
    return (
      <RouteLeaderboard
        startArticle={startArticle}
        goalArticle={goalArticle}
        userResult={{
          steps: navigationPath.length - 1,
          time: elapsedTime,
          path: navigationPath,
          hintsUsed,
        }}
        onNewQuest={onBackToSetup}
        user={user}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm space-y-4 lg:space-y-0">
        <Button
          onClick={onBackToSetup}
          variant="outline"
          className="flex items-center space-x-2 hover:scale-105 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{mode === "multiplayer" ? "Leave Room" : "New Quest"}</span>
        </Button>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="font-mono text-lg font-bold">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Badge variant="outline" className="text-sm bg-emerald-50 border-emerald-200">
              From: {startArticle}
            </Badge>
            <div className="hidden sm:flex items-center space-x-1">
              <ArrowLeft className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">navigate</span>
              <ArrowLeft className="w-3 h-3 text-gray-400 rotate-180" />
            </div>
            <Badge variant="outline" className="text-sm bg-purple-50 border-purple-200">
              To: {goalArticle}
            </Badge>
          </div>
        </div>
      </div>

      {/* Victory Banner */}
      {isGoalReached && (
        <Card className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="py-6">
            <div className="text-center space-y-3">
              <div className="text-3xl font-bold flex items-center justify-center space-x-2">
                <Trophy className="w-8 h-8" />
                <span>Quest Complete!</span>
              </div>
              <div className="text-lg">
                You reached <strong>{goalArticle}</strong> in <strong>{navigationPath.length - 1}</strong> steps and{" "}
                <strong>{formatTime(elapsedTime)}</strong>!
              </div>
              <div className="text-xl font-bold">Final Score: {calculateScore()}</div>
              {hintsUsed > 0 && <div className="text-sm opacity-90">Hints used: {hintsUsed}</div>}
              {mode === "solo" && <div className="text-sm opacity-90">Loading leaderboard...</div>}
              {mode === "multiplayer" && (
                <div className="text-sm opacity-90">Check the race progress above to see how others are doing!</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid xl:grid-cols-4 gap-6">
        {/* Main Wikipedia Viewer */}
        <div className="xl:col-span-3">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-purple-50 border-b">
              <CardTitle className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-2 lg:space-y-0">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  <span>Your Quest Navigation</span>
                  {mode === "multiplayer" && (
                    <Badge variant="outline" className="text-xs bg-blue-50">
                      Multiplayer
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Badge variant="secondary" className="text-sm">
                    Current: {currentArticle}
                  </Badge>
                  <Button
                    onClick={() => setShowHints(!showHints)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 hover:scale-105 transition-all duration-200"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>Hints</span>
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <WikipediaViewer article={currentArticle} onArticleChange={handleArticleChange} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quest Progress */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Compass className="w-5 h-5 text-emerald-500" />
                <span>Quest Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Steps:</span>
                  <Badge variant="outline">{navigationPath.length - 1}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time:</span>
                  <Badge variant="outline">{formatTime(elapsedTime)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Score:</span>
                  <Badge variant="outline">{calculateScore()}</Badge>
                </div>
                <NavigationPath path={navigationPath} goalArticle={goalArticle} />
              </div>
            </CardContent>
          </Card>

          {/* Hint System */}
          {showHints && (
            <HintSystem
              currentArticle={currentArticle}
              goalArticle={goalArticle}
              onHintUsed={() => setHintsUsed((prev) => prev + 1)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
