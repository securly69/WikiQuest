export async function GET() {
  try {
    // In a real implementation, you would fetch from a database
    // For now, return mock data
    const mockData = [
      {
        id: "1",
        playerName: "QuestMaster",
        startArticle: "Adolf Hitler",
        goalArticle: "Ice cream",
        steps: 4,
        time: 127,
        score: 850,
        date: "2024-01-15",
        hintsUsed: 0,
      },
      {
        id: "2",
        playerName: "WikiExplorer",
        startArticle: "Philosophy",
        goalArticle: "Bacon",
        steps: 6,
        time: 203,
        score: 720,
        date: "2024-01-14",
        hintsUsed: 1,
      },
    ]

    return Response.json(mockData)
  } catch (error) {
    console.error("Error fetching global leaderboard:", error)
    return Response.json([], { status: 500 })
  }
}
