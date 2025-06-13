import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Lightbulb } from "lucide-react"
import { WikipediaViewer } from "@/components/wikipedia-viewer"
import { NavigationPath } from "@/components/navigation-path"
import { HintSystem } from "@/components/hint-system"
import { RouteLeaderboard } from "@/components/route-leaderboard"

export function QuestPlay({
  startArticle,
  goalArticle,
  onBackToSetup,
  user
}) {
  const [currentArticle, setCurrentArticle] = useState(startArticle)
  const [navigationPath, setNavigationPath] = useState([startArticle])
  const [isGoalReached, setIsGoalReached] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState(new Date())
  const [showHints, setShowHints] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
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

  const handleGoalReached = useCallback(() => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    setIsGoalReached(true)
    const finalTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
    setElapsedTime(finalTime)
    setTimeout(() => {
      setShowLeaderboard(true)
    }, 2000)
  }, [startTime])

  useEffect(() => {
    if (currentArticle.toLowerCase() === goalArticle.toLowerCase() && !hasCompletedRef.current) {
      handleGoalReached()
    }
  }, [currentArticle, goalArticle, handleGoalReached])

  const handleArticleChange = (newArticle) => {
    if (hasCompletedRef.current) return
    setCurrentArticle(newArticle)
    setNavigationPath((prev) => [...prev, newArticle])
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
        onNewQuest={onBackToSetup}
        user={user}
      />
    )
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
            <span className="font-mono text-lg font-bold">{formatTime(elapsedTime)}</span>
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
