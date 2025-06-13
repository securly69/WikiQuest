"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Loader2 } from "lucide-react"

interface WikipediaViewerProps {
  article: string
  onArticleChange: (article: string) => void
}

export function WikipediaViewer({ article, onArticleChange }: WikipediaViewerProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchArticleContent(article)
  }, [article])

  const fetchArticleContent = async (articleTitle: string) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(articleTitle)}&format=json&origin=*&prop=text&disableeditsection=1`,
      )
      const data = await response.json()

      if (data.error) {
        setError(`Article not found: ${articleTitle}`)
        return
      }

      let htmlContent = data.parse.text["*"]
      htmlContent = processWikipediaLinks(htmlContent)
      setContent(htmlContent)
    } catch (err) {
      setError("Failed to load article content")
      console.error("Error fetching article:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const processWikipediaLinks = (html: string): string => {
    return html.replace(
      /<a\s+href="\/wiki\/([^"#]+)(?:#[^"]*)?"\s*(?:[^>]*)>([^<]+)<\/a>/g,
      (match, articlePath, linkText) => {
        const decodedArticle = decodeURIComponent(articlePath).replace(/_/g, " ")

        if (
          articlePath.includes(":") ||
          linkText.includes("edit") ||
          linkText.includes("[") ||
          decodedArticle.includes("Category:") ||
          decodedArticle.includes("File:") ||
          decodedArticle.includes("Template:")
        ) {
          return `<span class="text-gray-500">${linkText}</span>`
        }

        return `<span 
          class="wiki-link text-blue-600 hover:text-blue-800 cursor-pointer underline font-medium transition-all duration-200 hover:bg-blue-50 px-1 rounded" 
          data-article="${decodedArticle}"
          onclick="window.handleWikiLinkClick('${decodedArticle}')"
        >${linkText}</span>`
      },
    )
  }

  useEffect(() => {
    window.handleWikiLinkClick = (articleTitle: string) => {
      onArticleChange(articleTitle)
    }

    return () => {
      delete window.handleWikiLinkClick
    }
  }, [onArticleChange])

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading article...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading article</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[600px] overflow-y-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50">
            Wikipedia
          </Badge>
          <h1 className="text-xl font-bold text-gray-800">{article}</h1>
        </div>
        <a
          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(article.replace(/ /g, "_"))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View on Wikipedia</span>
        </a>
      </div>

      <div className="p-6">
        <div className="wikipedia-content prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  )
}
