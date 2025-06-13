"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Eye, ArrowRight } from "lucide-react"
import { getWikipediaLinks } from "@/lib/wikipedia-api"

interface HintSystemProps {
  currentArticle: string
  goalArticle: string
  onHintUsed: () => void
}

export function HintSystem({ currentArticle, goalArticle, onHintUsed }: HintSystemProps) {
  const [relevantLinks, setRelevantLinks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hintType, setHintType] = useState<"direction" | "links" | "path">("direction")

  const getDirectionHint = () => {
    const hints = [
      `Look for links related to "${goalArticle.split(" ")[0]}"`,
      `Try searching for broader categories that might connect to ${goalArticle}`,
      `Consider geographical, historical, or cultural connections`,
      `Look for people, places, or concepts that might bridge these topics`,
    ]
    return hints[Math.floor(Math.random() * hints.length)]
  }

  const getRelevantLinks = async () => {
    setIsLoading(true)
    try {
      const links = await getWikipediaLinks(currentArticle)

      const scoredLinks = links.map((link) => ({
        link,
        score: calculateRelevanceScore(link, goalArticle),
      }))

      const topLinks = scoredLinks
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => item.link)

      setRelevantLinks(topLinks)
    } catch (error) {
      console.error("Error getting relevant links:", error)
    }
    setIsLoading(false)
  }

  const calculateRelevanceScore = (link: string, goal: string): number => {
    let score = 0
    const linkWords = link.toLowerCase().split(/\s+/)
    const goalWords = goal.toLowerCase().split(/\s+/)

    for (const linkWord of linkWords) {
      for (const goalWord of goalWords) {
        if (linkWord === goalWord) {
          score += 50
        } else if (linkWord.includes(goalWord) || goalWord.includes(linkWord)) {
          score += 25
        }
      }
    }

    return score
  }

  const useHint = (type: "direction" | "links" | "path") => {
    setHintType(type)
    if (type === "links") {
      getRelevantLinks()
    }
    onHintUsed()
  }

  useEffect(() => {
    // Ensure hooks are called at the top level
  }, [])

  return (
    <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-yellow-800">
          <Lightbulb className="w-5 h-5" />
          <span>Quest Hints</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={() => setHintType("direction")}
            variant="outline"
            size="sm"
            className="justify-start border-yellow-300 hover:bg-yellow-100 transition-all duration-200"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Direction Hint
          </Button>

          <Button
            onClick={() => useHint("links")}
            variant="outline"
            size="sm"
            className="justify-start border-yellow-300 hover:bg-yellow-100 transition-all duration-200"
            disabled={isLoading}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isLoading ? "Loading..." : "Relevant Links"}
          </Button>
        </div>

        {hintType === "direction" && (
          <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">{getDirectionHint()}</p>
          </div>
        )}

        {hintType === "links" && relevantLinks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-yellow-800">Most relevant links on this page:</p>
            <div className="space-y-1">
              {relevantLinks.map((link, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-yellow-100 border-yellow-300">
                  {link}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
