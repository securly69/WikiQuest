"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bot, User, Play, Pause, Clock, Zap, Trophy, Lightbulb } from "lucide-react"
import { WikipediaViewer } from "@/components/wikipedia-viewer"
import { NavigationPath } from "@/components/navigation-path"
import { HintSystem } from "@/components/hint-system"
import { BotNavigator } from "@/lib/bot-navigator"

interface GamePlayProps {
  startArticle: string
  goalArticle: string
  onBackToSetup: () => void
  mode: "solo" | "multiplayer"
}

export function GamePlay({ startArticle, goalArticle, onBackToSetup, mode }: GamePlayProps) {
  const [currentArticle, setCurrentArticle] = useState(startArticle)
  const [navigationPath, setNavigationPath] = useState<string[]>([startArticle])
  const [isGoalReached, setIsGoalReached] = useState(false)
  const [botPath, setBotPath] = useState<string[]>([])
  const [isBotRunning, setIsBotRunning] = useState(false)
  const [botCurrentArticle, setBotCurrentArticle] = useState(startArticle)
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const botNavigatorRef = useRef<BotNavigator | null>(null)

  useEffect(() => {
    botNavigatorRef.current = new BotNavigator(startArticle, goalArticle)
    setStartTime(new Date())
  }, [startArticle, goalArticle])

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isGoalReached) {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, isGoalReached])

  useEffect(() => {
    if (currentArticle.toLowerCase() === goalArticle.toLowerCase()) {
      setIsGoalReached(true)
      // Save to leaderboard
      saveToLeaderboard()
    }
  }, [currentArticle, goalArticle])

  const saveToLeaderboard = async () => {
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startArticle,
          goalArticle,
          steps: navigationPath.length - 1,
          time: elapsedTime,
          hintsUsed,
          path: navigationPath,
        }),
      })
    } catch (error) {
      console.error("Failed to save to leaderboard:", error)
    }
  }

  const handleArticleChange = (newArticle: string) => {
    setCurrentArticle(newArticle)
    setNavigationPath((prev) => [...prev, newArticle])
  }

  const startBot = async () => {
    if (!botNavigatorRef.current || isBotRunning) return

    setIsBotRunning(true)
    setBotPath([startArticle])
    setBotCurrentArticle(startArticle)

    try {
      const path = await botNavigatorRef.current.findPath()

      for (let i = 1; i < path.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        if (!isBotRunning) break
        setBotCurrentArticle(path[i])
        setBotPath((prev) => [...prev, path[i]])
      }
    } catch (error) {
      console.error("Bot navigation failed:", error)
    } finally {
      setIsBotRunning(false)
    }
  }

  const stopBot = () => {
    setIsBotRunning(false)
    if (botNavigatorRef.current) {
      botNavigatorRef.current.stop()
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm space-y-4 sm:space-y-0">
        <Button onClick={onBackToSetup} variant="outline" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>New Race</span>
        </Button>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="font-mono text-lg font-bold">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm bg-green-50">
              From: {startArticle}
            </Badge>
            <div className="flex items-center space-x-1">
              <ArrowLeft className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">navigate</span>
              <ArrowLeft className="w-3 h-3 text-gray-400 rotate-180" />
            </div>
            <Badge variant="outline" className="text-sm bg-red-50">
              To: {goalArticle}
            </Badge>
          </div>
        </div>
      </div>

      {/* Victory Banner */}
      {isGoalReached && (
        <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white border-0 shadow-xl">
          <CardContent className="py-6">
            <div className="text-center space-y-3">
              <div className="text-3xl font-bold flex items-center justify-center space-x-2">
                <Trophy className="w-8 h-8" />
                <span>Victory!</span>
              </div>
              <div className="text-lg">
                You reached <strong>{goalArticle}</strong> in <strong>{navigationPath.length - 1}</strong> steps and{" "}
                <strong>{formatTime(elapsedTime)}</strong>!
              </div>
              <div className="text-xl font-bold">Score: {calculateScore()}</div>
              {hintsUsed > 0 && <div className="text-sm opacity-90">Hints used: {hintsUsed}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Wikipedia Viewer */}
        <div className="lg:col-span-3">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Your Navigation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-sm">
                    Current: {currentArticle}
                  </Badge>
                  <Button
                    onClick={() => setShowHints(!showHints)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
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
          {/* Race Progress */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Progress</span>
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

          {/* Bot Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <span>AI Competitor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                {!isBotRunning ? (
                  <Button onClick={startBot} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700">
                    <Play className="w-4 h-4" />
                    <span>Start AI</span>
                  </Button>
                ) : (
                  <Button onClick={stopBot} variant="destructive" className="flex items-center space-x-2">
                    <Pause className="w-4 h-4" />
                    <span>Stop AI</span>
                  </Button>
                )}
              </div>

              {botPath.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Steps:</span>
                    <Badge variant="outline" className="bg-purple-50">
                      {botPath.length - 1}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">AI Current:</div>
                    <Badge variant="outline" className="bg-purple-50">
                      {botCurrentArticle}
                    </Badge>
                  </div>
                  <NavigationPath path={botPath} goalArticle={goalArticle} isBot={true} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
