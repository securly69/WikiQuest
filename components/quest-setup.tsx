"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Compass, Target, Dice6 } from "lucide-react"
import { searchWikipediaArticles } from "@/lib/wikipedia-api"

interface QuestSetupProps {
  onStartGame: (start: string, goal: string) => void
}

const CURATED_CHALLENGES = {
  easy: [
    { start: "World War II", goal: "Climate change" },
    { start: "Leonardo da Vinci", goal: "Artificial intelligence" },
    { start: "Ancient Egypt", goal: "Social media" },
    { start: "Charles Darwin", goal: "Cryptocurrency" },
    { start: "Classical music", goal: "Video games" },
    { start: "Roman Empire", goal: "Space exploration" },
    { start: "Vincent van Gogh", goal: "Machine learning" },
    { start: "Industrial Revolution", goal: "Environmental science" },
  ],
  medium: [
    { start: "Photosynthesis", goal: "Jazz music" },
    { start: "Quantum mechanics", goal: "Fashion design" },
    { start: "Medieval literature", goal: "Skateboarding" },
    { start: "Thermodynamics", goal: "Poetry" },
    { start: "Paleontology", goal: "Hip hop culture" },
    { start: "Linguistics", goal: "Extreme sports" },
    { start: "Molecular biology", goal: "Street art" },
    { start: "Astrophysics", goal: "Culinary arts" },
    { start: "Anthropology", goal: "Electronic music" },
    { start: "Neuroscience", goal: "Martial arts" },
  ],
  hard: [
    { start: "Epistemology", goal: "Surfing" },
    { start: "Phenomenology", goal: "Beekeeping" },
    { start: "Metamorphic petrology", goal: "Origami" },
    { start: "Quantum field theory", goal: "Cheese making" },
    { start: "Poststructuralism", goal: "Competitive eating" },
    { start: "Organometallic chemistry", goal: "Yodeling" },
    { start: "Differential topology", goal: "Balloon animals" },
    { start: "Paleobotany", goal: "Beatboxing" },
    { start: "Semiotics", goal: "Juggling" },
    { start: "Crystallography", goal: "Ventriloquism" },
    { start: "Phenomenological sociology", goal: "Soap carving" },
    { start: "Computational fluid dynamics", goal: "Mime" },
  ],
}

export function QuestSetup({ onStartGame }: QuestSetupProps) {
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

  const getCuratedChallenge = () => {
    setIsLoading(true)
    const challenges = CURATED_CHALLENGES[difficulty]
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]
    setStartArticle(randomChallenge.start)
    setGoalArticle(randomChallenge.goal)
    setIsLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Solo Quest
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Embark on a solo adventure through Wikipedia. Challenge yourself to find the shortest path between articles.
        </p>
      </div>

      {/* Difficulty Selector */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Choose Your Quest Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {[
              {
                level: "easy",
                label: "Apprentice",
                color: "emerald",
                description: "Historical to modern topics",
                icon: "🌱",
              },
              {
                level: "medium",
                label: "Explorer",
                color: "blue",
                description: "Science to arts & culture",
                icon: "🗺️",
              },
              {
                level: "hard",
                label: "Master",
                color: "purple",
                description: "Abstract philosophy to niche hobbies",
                icon: "⚡",
              },
            ].map((option) => (
              <Button
                key={option.level}
                variant={difficulty === option.level ? "default" : "outline"}
                onClick={() => setDifficulty(option.level as any)}
                className={`flex flex-col items-center space-y-2 h-auto py-4 px-6 transition-all duration-200 ${
                  difficulty === option.level
                    ? option.color === "emerald"
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 scale-105"
                      : option.color === "blue"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 scale-105"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 scale-105"
                    : "hover:scale-105"
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="font-semibold">{option.label}</span>
                <span className="text-xs opacity-80 text-center">{option.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Setup Card */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center space-x-2">
            <Compass className="w-6 h-6 text-emerald-600" />
            <span>Set Your Quest Path</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Article Selection */}
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Start Article */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-700 text-lg">Quest Origin</h3>
                <p className="text-sm text-gray-500">Where your adventure begins</p>
              </div>
              <div className="relative">
                <Input
                  placeholder="Search starting article..."
                  value={startArticle}
                  onChange={(e) => {
                    setStartArticle(e.target.value)
                    handleStartSearch(e.target.value)
                  }}
                  className="text-center font-medium transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
                {startSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                    {startSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 first:rounded-t-md last:rounded-b-md transition-colors"
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
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-50 to-purple-50">
                Navigate →
              </Badge>
            </div>

            {/* Goal Article */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-700 text-lg">Quest Destination</h3>
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
                  className="text-center font-medium transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                />
                {goalSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                    {goalSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-purple-50 first:rounded-t-md last:rounded-b-md transition-colors"
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
              className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting Quest...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Compass className="w-5 h-5" />
                  <span>Begin Quest</span>
                </div>
              )}
            </Button>

            <Button
              onClick={getCuratedChallenge}
              variant="outline"
              disabled={isLoading}
              className="px-8 py-3 text-lg font-semibold border-2 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-purple-50 transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <div className="flex items-center space-x-2">
                <Dice6 className="w-5 h-5" />
                <span>Curated Quest</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
