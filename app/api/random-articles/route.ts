import { getRandomWikipediaArticle } from "@/lib/wikipedia-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get("difficulty") || "medium"

    // For now, return random articles regardless of difficulty
    // In a real implementation, you could curate articles based on difficulty
    const [start, goal] = await Promise.all([getRandomWikipediaArticle(), getRandomWikipediaArticle()])

    return Response.json({ start, goal })
  } catch (error) {
    console.error("Error getting random articles:", error)
    return Response.json({ start: "Albert Einstein", goal: "Pizza" }, { status: 500 })
  }
}
