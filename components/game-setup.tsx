"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Target, Lightbulb, Dice6 } from "lucide-react"
import { searchWikipediaArticles } from "@/lib/wikipedia-api"

interface GameSetupProps {
  onStartGame: (start: string, goal: string) => void
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [startArticle, setStartArticle] = useState("")
  const [goalArticle, setGoalArticle] = useState("")
  const [startSuggestions, setStartSuggestions] = useState<string[]>([])
  const [goalSuggestions, setGoalSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const handleStartSearch = async (query: string) => {
    if (query.length > 2) {
      const suggestions = await searchWikipediaArticles(query)
      setStartSuggestions(suggestions.slice(0, 5))
    } else {
      setStartSuggestions([])
    }
  }

  const handleGoalSearch = async (query: string) => {
    if (query.length > 2) {
      const suggestions = await searchWikipediaArticles(query)
      setGoalSuggestions(suggestions.slice(0, 5))
    } else {
      setGoalSuggestions([])
    }
  }

  const handleStartGame = () => {
    if (startArticle && goalArticle) {
      setIsLoading(true)
      onStartGame(startArticle, goalArticle)
    }
  }

  const getRandomArticles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/random-articles?difficulty=${difficulty}`)
      const { start, goal } = await response.json()
      setStartArticle(start)
      setGoalArticle(goal)
    } catch (error) {
      console.error("Error getting random articles:", error)
      setStartArticle("Albert Einstein")
      setGoalArticle("Pizza")
    }
    setIsLoading(false)
  }

  const smartRandomChallenge = async () => {
    setIsLoading(true)
    try {
      // Get a curated challenge based on difficulty
      const challenges = {
        easy: [
          { start: "United States", goal: "France" },
          { start: "Dog", goal: "Cat" },
          { start: "Apple", goal: "Orange" },
        ],
        medium: [
          { start: "Adolf Hitler", goal: "Ice cream" },
          { start: "Mathematics", goal: "Music" },
          { start: "Space", goal: "Ocean" },
        ],
        hard: [
          { start: "Philosophy", goal: "Bacon" },
          { start: "Quantum physics", goal: "Love" },
          { start: "Ancient Rome", goal: "Video games" },
        ],
      }

      const selectedChallenges = challenges[difficulty]
      const randomChallenge = selectedChallenges[Math.floor(Math.random() * selectedChallenges.length)]

      setStartArticle(randomChallenge.start)
      setGoalArticle(randomChallenge.goal)
    } catch (error) {
      console.error("Error getting smart challenge:", error)
    }
    setIsLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Solo Challenge
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Race against AI or challenge yourself to find the shortest path between Wikipedia articles
        </p>
      </div>

      {/* Difficulty Selector */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Choose Your Challenge Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4">
            {[
              { level: "easy", label: "Easy", color: "green", description: "Related topics" },
              { level: "medium", label: "Medium", color: "yellow", description: "Some connection" },
              { level: "hard", label: "Hard", color: "red", description: "Completely unrelated" },
            ].map((option) => (
              <Button
                key={option.level}
                variant={difficulty === option.level ? "default" : "outline"}
                onClick={() => setDifficulty(option.level as any)}
                className={`flex flex-col items-center space-y-1 h-auto py-3 px-6 ${
                  difficulty === option.level
                    ? option.color === "green"
                      ? "bg-green-600 hover:bg-green-700"
                      : option.color === "yellow"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-red-600 hover:bg-red-700"
                    : ""
                }`}
              >
                <span className="font-semibold">{option.label}</span>
                <span className="text-xs opacity-80">{option.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Setup Card */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center space-x-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <span>Set Your Course</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Article Selection */}
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Start Article */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-700 text-lg">Starting Point</h3>
                <p className="text-sm text-gray-500">Begin your journey here</p>
              </div>
              <div className="relative">
                <Input
                  placeholder="Search starting article..."
                  value={startArticle}
                  onChange={(e) => {
                    setStartArticle(e.target.value)
                    handleStartSearch(e.target.value)
                  }}
                  className="text-center font-medium"
                />
                {startSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                    {startSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 first:rounded-t-md last:rounded-b-md transition-colors"
                        onClick={() => {
                          setStartArticle(suggestion)
                          setStartSuggestions([])
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Arrow with Direction Indicator */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <Badge variant="outline" className="text-xs">
                Navigate →
              </Badge>
            </div>

            {/* Goal Article */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-700 text-lg">Destination</h3>
                <p className="text-sm text-gray-500">Your ultimate goal</p>
              </div>
              <div className="relative">
                <Input
                  placeholder="Search goal article..."
                  value={goalArticle}
                  onChange={(e) => {
                    setGoalArticle(e.target.value)
                    handleGoalSearch(e.target.value)
                  }}
                  className="text-center font-medium"
                />
                {goalSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                    {goalSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 first:rounded-t-md last:rounded-b-md transition-colors"
                        onClick={() => {
                          setGoalArticle(suggestion)
                          setGoalSuggestions([])
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleStartGame}
              disabled={!startArticle || !goalArticle || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting Race...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Start Race</span>
                </div>
              )}
            </Button>

            <Button
              onClick={smartRandomChallenge}
              variant="outline"
              disabled={isLoading}
              className="px-8 py-3 text-lg font-semibold border-2 hover:bg-purple-50"
              size="lg"
            >
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5" />
                <span>Smart Challenge</span>
              </div>
            </Button>

            <Button
              onClick={getRandomArticles}
              variant="outline"
              disabled={isLoading}
              className="px-8 py-3 text-lg font-semibold border-2 hover:bg-green-50"
              size="lg"
            >
              <div className="flex items-center space-x-2">
                <Dice6 className="w-5 h-5" />
                <span>Random</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
