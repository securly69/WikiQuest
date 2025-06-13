"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { SoloQuest } from "@/components/solo-quest"
import { AuthModal } from "@/components/auth-modal"
import { UserHistory } from "@/components/user-history"
import { useAuth } from "@/hooks/use-auth"

type GameMode = "solo" | "history"

export default function HomePage() {
  const [currentMode, setCurrentMode] = useState<GameMode>("solo")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, login, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-100">
      <Navigation
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        user={user}
        onLogin={() => setShowAuthModal(true)}
        onLogout={logout}
      />

      <main className="container mx-auto px-4 py-6">
        {currentMode === "solo" && <SoloQuest user={user} />}
        {currentMode === "history" && user && <UserHistory user={user} />}
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={login} />}
    </div>
  )
}
