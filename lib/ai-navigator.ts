import { getWikipediaLinks, getWikipediaContent } from "./wikipedia-api"

export interface NavigationStep {
  article: string
  timestamp: number
  reasoning?: string
}

export class AINavigator {
  private startArticle: string
  private goalArticle: string
  private visited: Set<string> = new Set()
  private isRunning = false
  private currentPath: NavigationStep[] = []
  private onStepCallback?: (step: NavigationStep) => void

  constructor(startArticle: string, goalArticle: string, onStep?: (step: NavigationStep) => void) {
    this.startArticle = startArticle
    this.goalArticle = goalArticle
    this.onStepCallback = onStep
  }

  async findPath(): Promise<NavigationStep[]> {
    this.isRunning = true
    this.visited.clear()
    this.currentPath = []

    const startStep: NavigationStep = {
      article: this.startArticle,
      timestamp: Date.now(),
      reasoning: "Starting point",
    }

    this.currentPath.push(startStep)
    this.onStepCallback?.(startStep)

    let currentArticle = this.startArticle
    let attempts = 0
    const maxAttempts = 15

    while (this.isRunning && attempts < maxAttempts) {
      if (currentArticle.toLowerCase() === this.goalArticle.toLowerCase()) {
        break
      }

      this.visited.add(currentArticle.toLowerCase())

      try {
        const nextArticle = await this.selectNextArticle(currentArticle)

        if (!nextArticle || this.visited.has(nextArticle.toLowerCase())) {
          // If stuck, try a broader search
          const broadLinks = await this.getBroaderLinks(currentArticle)
          const unvisited = broadLinks.filter((link) => !this.visited.has(link.toLowerCase()))

          if (unvisited.length === 0) break

          const randomNext = unvisited[Math.floor(Math.random() * Math.min(3, unvisited.length))]
          currentArticle = randomNext
        } else {
          currentArticle = nextArticle
        }

        const step: NavigationStep = {
          article: currentArticle,
          timestamp: Date.now(),
          reasoning: this.getReasoningForChoice(currentArticle),
        }

        this.currentPath.push(step)
        this.onStepCallback?.(step)

        // Add delay to simulate human-like navigation
        await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))
      } catch (error) {
        console.error(`AI navigation error at ${currentArticle}:`, error)
        break
      }

      attempts++
    }

    return this.currentPath
  }

  private async selectNextArticle(currentArticle: string): Promise<string | null> {
    try {
      // Get page content and links
      const [content, links] = await Promise.all([
        getWikipediaContent(currentArticle),
        getWikipediaLinks(currentArticle),
      ])

      // Score links based on relevance to goal
      const scoredLinks = await this.scoreLinks(links, content)

      // Filter out visited links and select best candidates
      const unvisitedLinks = scoredLinks.filter((item) => !this.visited.has(item.link.toLowerCase())).slice(0, 10)

      if (unvisitedLinks.length === 0) return null

      // Use weighted random selection favoring higher scores
      const totalScore = unvisitedLinks.reduce((sum, item) => sum + item.score, 0)

      if (totalScore === 0) {
        return unvisitedLinks[0].link
      }

      let random = Math.random() * totalScore
      for (const item of unvisitedLinks) {
        random -= item.score
        if (random <= 0) {
          return item.link
        }
      }

      return unvisitedLinks[0].link
    } catch (error) {
      console.error("Error selecting next article:", error)
      return null
    }
  }

  private async scoreLinks(links: string[], content: string): Promise<Array<{ link: string; score: number }>> {
    const goalWords = this.goalArticle.toLowerCase().split(/\s+/)
    const contentLower = content.toLowerCase()

    return links
      .map((link) => {
        let score = 0
        const linkLower = link.toLowerCase()
        const linkWords = linkLower.split(/\s+/)

        // Direct goal match
        if (linkLower === this.goalArticle.toLowerCase()) {
          score += 1000
        }

        // Word overlap with goal
        for (const goalWord of goalWords) {
          if (goalWord.length < 3) continue

          for (const linkWord of linkWords) {
            if (linkWord === goalWord) {
              score += 100
            } else if (linkWord.includes(goalWord) || goalWord.includes(linkWord)) {
              score += 50
            }
          }
        }

        // Context relevance (if link appears in content)
        if (contentLower.includes(linkLower)) {
          score += 30
        }

        // Prefer shorter, more general articles
        if (link.length < 20 && !link.includes("(") && !link.includes(",")) {
          score += 20
        }

        // Penalize very specific or meta articles
        if (
          link.includes("List of") ||
          link.includes("Category:") ||
          link.includes("disambiguation") ||
          link.includes("Template:")
        ) {
          score -= 50
        }

        // Boost common connecting topics
        const connectingTopics = [
          "history",
          "culture",
          "science",
          "art",
          "music",
          "literature",
          "philosophy",
          "politics",
          "geography",
          "religion",
          "technology",
          "society",
          "people",
          "world",
          "international",
          "modern",
          "ancient",
        ]

        for (const topic of connectingTopics) {
          if (linkLower.includes(topic)) {
            score += 15
          }
        }

        return { link, score: Math.max(0, score) }
      })
      .sort((a, b) => b.score - a.score)
  }

  private async getBroaderLinks(article: string): Promise<string[]> {
    try {
      const links = await getWikipediaLinks(article)

      // Look for broader category links
      const broaderLinks = links.filter((link) => {
        const lower = link.toLowerCase()
        return (
          lower.includes("history") ||
          lower.includes("culture") ||
          lower.includes("society") ||
          lower.includes("world") ||
          lower.includes("international") ||
          lower.includes("general") ||
          (link.split(" ").length <= 2 && !link.includes("("))
        )
      })

      return broaderLinks.length > 0 ? broaderLinks : links.slice(0, 20)
    } catch (error) {
      console.error("Error getting broader links:", error)
      return []
    }
  }

  private getReasoningForChoice(article: string): string {
    const goalWords = this.goalArticle.toLowerCase().split(/\s+/)
    const articleWords = article.toLowerCase().split(/\s+/)

    // Check for word overlap
    const overlap = goalWords.some((gw) => articleWords.some((aw) => aw.includes(gw) || gw.includes(aw)))

    if (overlap) {
      return `Found connection to "${this.goalArticle}"`
    }

    if (article.toLowerCase().includes("history")) {
      return "Exploring historical connections"
    }

    if (article.toLowerCase().includes("culture") || article.toLowerCase().includes("society")) {
      return "Following cultural pathways"
    }

    return "Strategic navigation choice"
  }

  stop() {
    this.isRunning = false
  }

  getCurrentPath(): NavigationStep[] {
    return [...this.currentPath]
  }

  isNavigating(): boolean {
    return this.isRunning
  }
}
