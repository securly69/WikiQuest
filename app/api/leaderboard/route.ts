export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In a real implementation, you would save this to a database
    console.log("Saving to leaderboard:", data)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error saving to leaderboard:", error)
    return Response.json({ error: "Failed to save" }, { status: 500 })
  }
}
