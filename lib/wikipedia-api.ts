export async function searchWikipediaArticles(query: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=10&namespace=0&format=json&origin=*`,
    )
    const data = await response.json()
    return data[1] || []
  } catch (error) {
    console.error("Error searching Wikipedia:", error)
    return []
  }
}

export async function getWikipediaLinks(article: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(article)}&prop=links&pllimit=500&format=json&origin=*`,
    )
    const data = await response.json()
    const pages = data.query?.pages

    if (!pages) return []

    const pageId = Object.keys(pages)[0]
    const links = pages[pageId]?.links || []

    return links.map((link: any) => link.title).filter((title: string) => !title.includes(":"))
  } catch (error) {
    console.error("Error fetching Wikipedia links:", error)
    return []
  }
}

export async function getWikipediaContent(article: string): Promise<string> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(article)}&prop=extracts&exintro=1&explaintext=1&format=json&origin=*`,
    )
    const data = await response.json()
    const pages = data.query?.pages

    if (!pages) return ""

    const pageId = Object.keys(pages)[0]
    return pages[pageId]?.extract || ""
  } catch (error) {
    console.error("Error fetching Wikipedia content:", error)
    return ""
  }
}

export async function getRandomWikipediaArticle(): Promise<string> {
  try {
    const response = await fetch(
      "https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*",
    )
    const data = await response.json()
    return data.query?.random?.[0]?.title || "Wikipedia"
  } catch (error) {
    console.error("Error getting random article:", error)
    return "Wikipedia"
  }
}
