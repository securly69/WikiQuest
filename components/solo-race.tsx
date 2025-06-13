"use client"

import { useState } from "react"
import { GameSetup } from "@/components/game-setup"
import { GamePlay } from "@/components/game-play"

export function SoloRace() {
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
        <GameSetup onStartGame={handleStartGame} />
      ) : (
        <GamePlay startArticle={startArticle} goalArticle={goalArticle} onBackToSetup={handleBackToSetup} mode="solo" />
      )}
    </>
  )
}
