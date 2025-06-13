export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const route = searchParams.get("route")

    // In a real implementation, you would fetch route-specific data from a database
    // For now, return mock data
    const mockData = [
      {
        id: "1",
        playerName: "RouteExpert",
        startArticle: route?.split(" → ")[0] || "Unknown",
        goalArticle: route?.split(" → ")[1] || "Unknown",
        steps: 3,
        time: 89,
        score: 920,
        date: "2024-01-15",
        hintsUsed: 0,
      },
    ]

    return Response.json(mockData)
  } catch (error) {
    console.error("Error fetching route leaderboard:", error)
    return Response.json([], { status: 500 })
  }
}
