// Simple in-memory storage for demo purposes
// In production, this would use a proper database
const rooms: Record<string, any> = {}

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const room = rooms[params.roomId]
    if (!room) {
      return Response.json({ error: "Room not found" }, { status: 404 })
    }

    return Response.json(room)
  } catch (error) {
    console.error("Error fetching room:", error)
    return Response.json({ error: "Failed to fetch room" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const roomData = await request.json()
    rooms[params.roomId] = roomData

    return Response.json({ success: true, room: roomData })
  } catch (error) {
    console.error("Error updating room:", error)
    return Response.json({ error: "Failed to update room" }, { status: 500 })
  }
}
