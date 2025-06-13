"use client"

import { useState } from "react"
import { QuestSetup } from "@/components/quest-setup"
import { QuestPlay } from "@/components/quest-play"
import type { User } from "@/hooks/use-auth"

interface SoloQuestProps {
  user: User | null
}

export function SoloQuest({ user }: SoloQuestProps) {
  const [gameState, setGameState] = useState<"setup" | "playing">("setup")
  const [startArticle, setStartArticle] = useState("")
  const [goalArticle, setGoalArticle] = useState("")

  const handleStartGame = (start: string, goal: string) => {
    setStartArticle(start)
    setGoalArticle(goal)
    setGameState("playing")
  }

  const handleBackToSetup = () => {
    setGameState("setup")
    setStartArticle("")
    setGoalArticle("")
  }

  return (
    <>
      {gameState === "setup" ? (
        <QuestSetup onStartGame={handleStartGame} />
      ) : (
        <QuestPlay
          startArticle={startArticle}
          goalArticle={goalArticle}
          onBackToSetup={handleBackToSetup}
          mode="solo"
          user={user}
        />
      )}
    </>
  )
}
