"use client"

import { Button } from "@/components/ui/button"
import { Compass, Users, History, User, LogOut } from "lucide-react"
import type { User as UserType } from "@/hooks/use-auth"

interface NavigationProps {
  currentMode: "solo" | "multiplayer" | "history"
  onModeChange: (mode: "solo" | "multiplayer" | "history") => void
  user: UserType | null
  onLogin: () => void
  onLogout: () => void
}

export function Navigation({ currentMode, onModeChange, user, onLogin, onLogout }: NavigationProps) {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-12">
              <Compass className="w-7 h-7 text-white transform -rotate-12" />
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                WikiQuest
              </div>
              <div className="text-xs text-gray-500 font-medium -mt-1">Navigate • Discover • Conquer</div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant={currentMode === "solo" ? "default" : "ghost"}
              onClick={() => onModeChange("solo")}
              className={`flex items-center space-x-2 transition-all duration-200 ${
                currentMode === "solo"
                  ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg scale-105"
                  : "hover:bg-emerald-50 hover:scale-105"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Solo Quest</span>
            </Button>

            <Button
              variant={currentMode === "multiplayer" ? "default" : "ghost"}
              onClick={() => onModeChange("multiplayer")}
              className={`flex items-center space-x-2 transition-all duration-200 ${
                currentMode === "multiplayer"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                  : "hover:bg-blue-50 hover:scale-105"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Multiplayer</span>
            </Button>

            {user && (
              <Button
                variant={currentMode === "history" ? "default" : "ghost"}
                onClick={() => onModeChange("history")}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  currentMode === "history"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                    : "hover:bg-purple-50 hover:scale-105"
                }`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            )}

            {/* User Section */}
            <div className="flex items-center space-x-2 ml-4 border-l border-gray-200 pl-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-blue-50 px-3 py-2 rounded-lg">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-600 hover:text-red-600">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={onLogin}
                  variant="outline"
                  className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-blue-100"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
