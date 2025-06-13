// Simple in-memory storage for demo purposes
// In production, this would use a proper database
const rooms: Record<string, any> = {}

export async function POST(request: Request) {
  try {
    const roomData = await request.json()
    rooms[roomData.id] = roomData

    return Response.json({ success: true, room: roomData })
  } catch (error) {
    console.error("Error creating room:", error)
    return Response.json({ error: "Failed to create room" }, { status: 500 })
  }
}
