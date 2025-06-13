import type { NextRequest } from "next/server"
import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

// In-memory storage for rooms (in production, use Redis or database)
const rooms = new Map()

export async function GET(req: NextRequest) {
  // This endpoint is just for Socket.IO server initialization
  // The actual Socket.IO server should be running separately
  return new Response("Socket.IO server should be running on port 3001", { status: 200 })
}

// Socket.IO server logic (this would typically be in a separate server file)
export function initializeSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    socket.on("join-room", ({ roomId, user }) => {
      socket.join(roomId)

      let room = rooms.get(roomId)
      if (!room) {
        room = {
          id: roomId,
          creator: user.username,
          createdAt: new Date().toISOString(),
          players: [],
          status: "waiting",
        }
        rooms.set(roomId, room)
      }

      // Add player if not already in room
      if (!room.players.find((p: any) => p.id === user.id)) {
        room.players.push({
          id: user.id,
          username: user.username,
          currentArticle: null,
          steps: 0,
          completed: false,
        })
      }

      io.to(roomId).emit("room-updated", room)
    })

    socket.on("start-game", ({ roomId, challenge }) => {
      const room = rooms.get(roomId)
      if (room) {
        room.status = "playing"
        room.startArticle = challenge.start
        room.goalArticle = challenge.goal
        rooms.set(roomId, room)

        io.to(roomId).emit("game-started", {
          startArticle: challenge.start,
          goalArticle: challenge.goal,
        })
        io.to(roomId).emit("room-updated", room)
      }
    })

    socket.on("player-progress", ({ roomId, playerId, currentArticle, steps, path }) => {
      const room = rooms.get(roomId)
      if (room) {
        const player = room.players.find((p: any) => p.id === playerId)
        if (player) {
          player.currentArticle = currentArticle
          player.steps = steps
          player.path = path
        }
        rooms.set(roomId, room)

        socket.to(roomId).emit("player-progress", {
          playerId,
          currentArticle,
          steps,
          path,
        })
      }
    })

    socket.on("player-completed", ({ roomId, playerId, completionTime, steps, path }) => {
      const room = rooms.get(roomId)
      if (room) {
        const player = room.players.find((p: any) => p.id === playerId)
        if (player) {
          player.completed = true
          player.completionTime = completionTime
          player.steps = steps
          player.path = path
        }
        rooms.set(roomId, room)

        io.to(roomId).emit("player-completed", {
          playerId,
          completionTime,
          steps,
          path,
        })
      }
    })

    socket.on("leave-room", ({ roomId, userId }) => {
      socket.leave(roomId)
      const room = rooms.get(roomId)
      if (room) {
        room.players = room.players.filter((p: any) => p.id !== userId)
        if (room.players.length === 0) {
          rooms.delete(roomId)
        } else {
          rooms.set(roomId, room)
          io.to(roomId).emit("room-updated", room)
        }
      }
    })

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)
    })
  })

  return io
}
