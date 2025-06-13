import { Badge } from "@/components/ui/badge"
import { ArrowDown, Target, Bot, User } from "lucide-react"

interface NavigationPathProps {
  path: string[]
  goalArticle: string
  isBot?: boolean
}

export function NavigationPath({ path, goalArticle, isBot = false }: NavigationPathProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        <span>Steps: {path.length - 1}</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {path.map((article, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="text-xs text-gray-500 w-6 mt-1 font-mono">{index + 1}.</div>
            <div className="flex-1 min-w-0">
              <Badge
                variant={article.toLowerCase() === goalArticle.toLowerCase() ? "default" : "outline"}
                className={`text-xs w-full justify-start truncate transition-all duration-200 ${
                  isBot
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : article.toLowerCase() === goalArticle.toLowerCase()
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : ""
                }`}
              >
                <span className="truncate">{article}</span>
                {article.toLowerCase() === goalArticle.toLowerCase() && (
                  <Target className="w-3 h-3 ml-1 flex-shrink-0" />
                )}
              </Badge>
            </div>
            {index < path.length - 1 && <ArrowDown className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}
