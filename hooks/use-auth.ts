"use client"

import { useState, useEffect, useCallback } from "react"

export interface User {
  id: string
  username: string
  email: string
  joinDate: string
}

export interface RaceHistory {
  id: string
  startArticle: string
  goalArticle: string
  steps: number
  time: number
  path: string[]
  completedAt: string
  hintsUsed: number
}

// Simple hash function to replace btoa
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}

// Generate unique race ID
function generateRaceId(startArticle: string, goalArticle: string, timestamp: number): string {
  return simpleHash(`${startArticle}-${goalArticle}-${timestamp}`)
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("wikiquest_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (username: string, email: string, password: string, isSignUp = false) => {
    try {
      if (isSignUp) {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem("wikiquest_users") || "{}")
        if (existingUsers[username]) {
          throw new Error("Username already exists")
        }

        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          username,
          email,
          joinDate: new Date().toISOString(),
        }

        // Save user credentials with simple hash
        existingUsers[username] = {
          ...newUser,
          password: simpleHash(password),
        }
        localStorage.setItem("wikiquest_users", JSON.stringify(existingUsers))

        // Initialize user history
        localStorage.setItem(`wikiquest_history_${newUser.id}`, JSON.stringify([]))

        setUser(newUser)
        localStorage.setItem("wikiquest_user", JSON.stringify(newUser))
        return { success: true }
      } else {
        // Login existing user
        const existingUsers = JSON.parse(localStorage.getItem("wikiquest_users") || "{}")
        const userData = existingUsers[username]

        if (!userData || userData.password !== simpleHash(password)) {
          throw new Error("Invalid username or password")
        }

        const { password: _, ...userWithoutPassword } = userData
        setUser(userWithoutPassword)
        localStorage.setItem("wikiquest_user", JSON.stringify(userWithoutPassword))
        return { success: true }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Authentication failed" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("wikiquest_user")
  }

  const saveRaceHistory = useCallback(
    (race: Omit<RaceHistory, "id" | "completedAt">) => {
      if (!user) return

      const timestamp = Date.now()
      const raceId = generateRaceId(race.startArticle, race.goalArticle, timestamp)

      const newRace: RaceHistory = {
        ...race,
        id: raceId,
        completedAt: new Date(timestamp).toISOString(),
      }

      const existingHistory = JSON.parse(localStorage.getItem(`wikiquest_history_${user.id}`) || "[]")

      // Check for duplicates based on route and similar completion time (within 5 seconds)
      const isDuplicate = existingHistory.some(
        (existing: RaceHistory) =>
          existing.startArticle === race.startArticle &&
          existing.goalArticle === race.goalArticle &&
          Math.abs(new Date(existing.completedAt).getTime() - timestamp) < 5000,
      )

      if (!isDuplicate) {
        existingHistory.push(newRace)
        localStorage.setItem(`wikiquest_history_${user.id}`, JSON.stringify(existingHistory))

        // Also save to global leaderboard
        saveToGlobalLeaderboard(newRace)
      }
    },
    [user],
  )

  const saveToGlobalLeaderboard = (race: RaceHistory) => {
    if (!user) return

    const leaderboardEntry = {
      id: race.id,
      username: user.username,
      startArticle: race.startArticle,
      goalArticle: race.goalArticle,
      steps: race.steps,
      time: race.time,
      path: race.path,
      hintsUsed: race.hintsUsed,
      completedAt: race.completedAt,
      score: calculateScore(race.steps, race.time, race.hintsUsed),
    }

    // Global leaderboard
    const globalLeaderboard = JSON.parse(localStorage.getItem("wikiquest_global_leaderboard") || "[]")
    globalLeaderboard.push(leaderboardEntry)

    // Keep only top 100 entries
    globalLeaderboard.sort((a: any, b: any) => b.score - a.score)
    localStorage.setItem("wikiquest_global_leaderboard", JSON.stringify(globalLeaderboard.slice(0, 100)))

    // Route-specific leaderboard
    const routeKey = `${race.startArticle} → ${race.goalArticle}`
    const routeHash = simpleHash(routeKey)
    const routeLeaderboard = JSON.parse(localStorage.getItem(`wikiquest_route_${routeHash}`) || "[]")

    // Remove any existing entry from this user for this route
    const filteredRouteLeaderboard = routeLeaderboard.filter((entry: any) => entry.username !== user.username)
    filteredRouteLeaderboard.push(leaderboardEntry)

    // Sort by score and keep top 50
    filteredRouteLeaderboard.sort((a: any, b: any) => b.score - a.score)
    localStorage.setItem(`wikiquest_route_${routeHash}`, JSON.stringify(filteredRouteLeaderboard.slice(0, 50)))
  }

  const calculateScore = (steps: number, time: number, hintsUsed: number): number => {
    const baseScore = 1000
    const stepPenalty = steps * 10
    const timePenalty = Math.floor(time / 10)
    const hintPenalty = hintsUsed * 50
    return Math.max(0, baseScore - stepPenalty - timePenalty - hintPenalty)
  }

  const getUserHistory = (): RaceHistory[] => {
    if (!user) return []
    return JSON.parse(localStorage.getItem(`wikiquest_history_${user.id}`) || "[]")
  }

  return {
    user,
    login,
    logout,
    saveRaceHistory,
    getUserHistory,
  }
}
