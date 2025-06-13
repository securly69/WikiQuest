"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Clock, Compass, Trophy, Lightbulb, Bot, Play, Pause } from "lucide-react"
import { WikipediaViewer } from "@/components/wikipedia-viewer"
import { NavigationPath } from "@/components/navigation-path"
import { HintSystem } from "@/components/hint-system"
import { RouteLeaderboard } from "@/components/route-leaderboard"
import { AINavigator, type NavigationStep } from "@/lib/ai-navigator"
import { useAuth } from "@/hooks/use-auth"
import type { User as UserType } from "@/hooks/use-auth"

interface QuestPlayProps {
  startArticle: string
  goalArticle: string
  onBackToSetup: () => void
  mode: "solo" | "multiplayer"
  user: UserType | null
}

export function QuestPlay({ startArticle, goalArticle, onBackToSetup, mode, user }: QuestPlayProps) {
  const [currentArticle, setCurrentArticle] = useState(startArticle)
  const [navigationPath, setNavigationPath] = useState<string[]>([startArticle])
  const [isGoalReached, setIsGoalReached] = useState(false)
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // AI opponent state
  const [aiPath, setAiPath] = useState<NavigationStep[]>([])
  const [isAiRunning, setIsAiRunning] = useState(false)
  const [aiCurrentArticle, setAiCurrentArticle] = useState(startArticle)
  const [aiCompleted, setAiCompleted] = useState(false)
  const aiNavigatorRef = useRef<AINavigator | null>(null)

  const { saveRaceHistory } = useAuth()
  const hasCompletedRef = useRef(false)

  // Initialize AI navigator
  useEffect(() => {
    const handleAiStep = (step: NavigationStep) => {
      setAiPath((prev) => [...prev, step])
      setAiCurrentArticle(step.article)

      // Check if AI reached goal
      if (step.article.toLowerCase() === goalArticle.toLowerCase()) {
        setAiCompleted(true)
        setIsAiRunning(false)
      }
    }

    aiNavigatorRef.current = new AINavigator(startArticle, goalArticle, handleAiStep)
    setStartTime(new Date())
  }, [startArticle, goalArticle])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isGoalReached && !aiCompleted) {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, isGoalReached, aiCompleted])

  // Goal reached effect - using useCallback to prevent re-renders
  const handleGoalReached = useCallback(() => {
    if (hasCompletedRef.current) return

    hasCompletedRef.current = true
    setIsGoalReached(true)

    if (user) {
      const raceData = {
        startArticle,
        goalArticle,
        steps: navigationPath.length - 1,
        time: elapsedTime,
        hintsUsed,
        path: navigationPath,
      }

      // Use setTimeout to prevent re-render issues
      setTimeout(() => {
        saveRaceHistory(raceData)
      }, 100)
    }

    // Show leaderboard after delay
    setTimeout(() => setShowLeaderboard(true), 2000)
  }, [user, saveRaceHistory, startArticle, goalArticle, navigationPath, elapsedTime, hintsUsed])

  useEffect(() => {
    if (currentArticle.toLowerCase() === goalArticle.toLowerCase() && !hasCompletedRef.current) {
      handleGoalReached()
    }
  }, [currentArticle, goalArticle, handleGoalReached])

  const handleArticleChange = (newArticle: string) => {
    setCurrentArticle(newArticle)
    setNavigationPath((prev) => [...prev, newArticle])
  }

  const startAI = async () => {
    if (!aiNavigatorRef.current || isAiRunning) return

    setIsAiRunning(true)
    setAiPath([])
    setAiCurrentArticle(startArticle)
    setAiCompleted(false)

    try {
      await aiNavigatorRef.current.findPath()
    } catch (error) {
      console.error("AI navigation failed:", error)
    } finally {
      setIsAiRunning(false)
    }
  }

  const stopAI = () => {
    setIsAiRunning(false)
    if (aiNavigatorRef.current) {
      aiNavigatorRef.current.stop()
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

  if (showLeaderboard) {
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
        aiResult={
          aiPath.length > 1
            ? {
                steps: aiPath.length - 1,
                time: Math.floor((aiPath[aiPath.length - 1]?.timestamp - aiPath[0]?.timestamp) / 1000),
                path: aiPath.map((step) => step.article),
                completed: aiCompleted,
              }
            : undefined
        }
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
          <span>New Quest</span>
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
      {(isGoalReached || aiCompleted) && (
        <Card className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="py-6">
            <div className="text-center space-y-3">
              <div className="text-3xl font-bold flex items-center justify-center space-x-2">
                <Trophy className="w-8 h-8" />
                <span>{isGoalReached && aiCompleted ? "Race Complete!" : isGoalReached ? "You Won!" : "AI Won!"}</span>
              </div>
              {isGoalReached && (
                <div className="text-lg">
                  You reached <strong>{goalArticle}</strong> in <strong>{navigationPath.length - 1}</strong> steps and{" "}
                  <strong>{formatTime(elapsedTime)}</strong>!
                </div>
              )}
              {aiCompleted && (
                <div className="text-lg">
                  AI reached <strong>{goalArticle}</strong> in <strong>{aiPath.length - 1}</strong> steps!
                </div>
              )}
              {isGoalReached && (
                <>
                  <div className="text-xl font-bold">Final Score: {calculateScore()}</div>
                  {hintsUsed > 0 && <div className="text-sm opacity-90">Hints used: {hintsUsed}</div>}
                </>
              )}
              <div className="text-sm opacity-90">Loading leaderboard...</div>
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

          {/* AI Opponent */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <span>AI Opponent</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                {!isAiRunning ? (
                  <Button
                    onClick={startAI}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105"
                    disabled={aiCompleted}
                  >
                    <Play className="w-4 h-4" />
                    <span>Start AI</span>
                  </Button>
                ) : (
                  <Button
                    onClick={stopAI}
                    variant="destructive"
                    className="flex items-center space-x-2 hover:scale-105 transition-all duration-200"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Stop AI</span>
                  </Button>
                )}
              </div>

              {aiPath.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Steps:</span>
                    <Badge variant="outline" className="bg-purple-50">
                      {aiPath.length - 1}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">AI Current:</div>
                    <Badge variant="outline" className="bg-purple-50">
                      {aiCurrentArticle}
                    </Badge>
                    {aiCompleted && (
                      <Badge variant="default" className="ml-2 bg-green-600">
                        Complete!
                      </Badge>
                    )}
                  </div>
                  <NavigationPath path={aiPath.map((step) => step.article)} goalArticle={goalArticle} isBot={true} />

                  {/* Show AI reasoning for current step */}
                  {aiPath.length > 0 && aiPath[aiPath.length - 1]?.reasoning && (
                    <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                      <strong>AI Thinking:</strong> {aiPath[aiPath.length - 1].reasoning}
                    </div>
                  )}
                </div>
              )}
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
