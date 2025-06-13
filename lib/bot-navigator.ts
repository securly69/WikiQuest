import { getWikipediaLinks } from "./wikipedia-api"

export class BotNavigator {
  private startArticle: string
  private goalArticle: string
  private visited: Set<string> = new Set()
  private isRunning = false

  constructor(startArticle: string, goalArticle: string) {
    this.startArticle = startArticle
    this.goalArticle = goalArticle
  }

  async findPath(): Promise<string[]> {
    this.isRunning = true
    this.visited.clear()

    const path = await this.breadthFirstSearch()
    return path
  }

  stop() {
    this.isRunning = false
  }

  private async breadthFirstSearch(): Promise<string[]> {
    const queue: { article: string; path: string[] }[] = [{ article: this.startArticle, path: [this.startArticle] }]

    while (queue.length > 0 && this.isRunning) {
      const { article, path } = queue.shift()!

      if (article.toLowerCase() === this.goalArticle.toLowerCase()) {
        return path
      }

      if (this.visited.has(article.toLowerCase()) || path.length > 6) {
        continue
      }

      this.visited.add(article.toLowerCase())

      try {
        const links = await this.getRelevantLinks(article)

        for (const link of links.slice(0, 10)) {
          if (!this.visited.has(link.toLowerCase()) && this.isRunning) {
            queue.push({
              article: link,
              path: [...path, link],
            })
          }
        }
      } catch (error) {
        console.error(`Error processing ${article}:`, error)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    return [this.startArticle]
  }

  private async getRelevantLinks(article: string): Promise<string[]> {
    const allLinks = await getWikipediaLinks(article)

    const scoredLinks = allLinks.map((link) => ({
      link,
      score: this.calculateRelevanceScore(link, this.goalArticle),
    }))

    return scoredLinks
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((item) => item.link)
  }

  private calculateRelevanceScore(link: string, goal: string): number {
    let score = 0

    if (link.toLowerCase() === goal.toLowerCase()) {
      return 1000
    }

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

    if (link.length < 20) score += 10
    if (!link.includes("(") && !link.includes(",")) score += 5

    if (link.includes("disambiguation") || link.includes("List of")) {
      score -= 20
    }

    return score
  }
}
