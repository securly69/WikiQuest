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
}

export function GamePlay({ startArticle, goalArticle, onBackToSetup }: GamePlayProps) {
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
    } catch (error) {}
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
        setBotCurrentArticle(path[i])
        setBotPath(path.slice(0, i + 1))
      }
    } finally {
      setIsBotRunning(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
            <span className="font-mono text-lg font-bold">{elapsedTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowHints((s) => !s)}
              variant="outline"
              className={`flex items-center space-x-2 ${showHints ? "bg-yellow-50" : ""}`}
            >
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span>Hints</span>
            </Button>
            <span className="text-sm text-gray-500">{hintsUsed} used</span>
          </div>
        </div>
      </div>
      <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-blue-700">Start:</span>
            <span className="font-mono">{startArticle}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-green-700">Goal:</span>
            <span className="font-mono">{goalArticle}</span>
          </div>
        </div>
        <NavigationPath path={navigationPath} />
        <WikipediaViewer
          article={currentArticle}
          onArticleChange={handleArticleChange}
          goalArticle={goalArticle}
          isGoalReached={isGoalReached}
        />
        {showHints && (
          <HintSystem
            currentArticle={currentArticle}
            goalArticle={goalArticle}
            navigationPath={navigationPath}
            onHintUsed={() => setHintsUsed((n) => n + 1)}
          />
        )}
      </div>
    </div>
  )
}
