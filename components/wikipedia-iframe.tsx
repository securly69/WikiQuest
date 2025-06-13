"use client"

import { useEffect, useRef, useState } from "react"

interface WikipediaIframeProps {
  article: string
  onArticleChange: (article: string) => void
}

export function WikipediaIframe({ article, onArticleChange }: WikipediaIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const initialUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(article.replace(/ /g, "_"))}`
    iframe.src = initialUrl
    setCurrentUrl(initialUrl)

    // Monitor iframe URL changes
    const checkUrlChange = () => {
      try {
        if (iframe.contentWindow) {
          const newUrl = iframe.contentWindow.location.href
          if (newUrl !== currentUrl && newUrl.includes("wikipedia.org/wiki/")) {
            setCurrentUrl(newUrl)

            // Extract article title from URL
            const urlParts = newUrl.split("/wiki/")
            if (urlParts.length > 1) {
              const articleTitle = decodeURIComponent(urlParts[1]).replace(/_/g, " ").split("#")[0] // Remove anchor links

              if (articleTitle !== article) {
                onArticleChange(articleTitle)
              }
            }
          }
        }
      } catch (error) {
        // Cross-origin restrictions prevent direct access
        // We'll use postMessage instead
      }
    }

    // Check for URL changes periodically
    const interval = setInterval(checkUrlChange, 1000)

    // Listen for postMessage from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === "https://en.wikipedia.org") {
        if (event.data.type === "urlChange") {
          const articleTitle = event.data.article
          if (articleTitle && articleTitle !== article) {
            onArticleChange(articleTitle)
          }
        }
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      clearInterval(interval)
      window.removeEventListener("message", handleMessage)
    }
  }, [article, currentUrl, onArticleChange])

  return (
    <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        title="Wikipedia Article"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  )
}
