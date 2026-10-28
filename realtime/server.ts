import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { authenticateSocketToken, authorizeProjectRoomAccess } from "../src/lib/chat/socket-auth";
import { saveProjectMessage, markProjectMessagesRead } from "../src/lib/chat/chat-service";
import { logger } from "../src/lib/logger";

const PORT = Number(process.env.REALTIME_PORT || 3001);
const CLIENT_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", service: "realtime-socket", timestamp: new Date() }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new SocketIOServer(server, {
  cors: {
    origin: [CLIENT_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

// Authentication Middleware
io.use(async (socket, next) => {
  try {
    // Extract token from auth handshake or cookies
    let token = socket.handshake.auth?.token;
    if (!token && socket.handshake.headers.cookie) {
      const match = socket.handshake.headers.cookie.match(/session_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const user = await authenticateSocketToken(token);
    if (!user) {
      return next(new Error("Invalid or expired session"));
    }

    // Attach authenticated user - NEVER trust client-provided user IDs
    socket.data.user = user;
    next();
  } catch (error) {
    logger.error("SocketAuthMiddlewareError", "Error during socket handshake", { error: String(error) });
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;
  logger.info("SocketConnected", `User connected: ${user.name} (${user.id}, ${user.role})`);

  // Join Project Room
  socket.on("join:project", async (data, callback) => {
    try {
      const projectRequestId = data?.projectRequestId;
      if (!projectRequestId) {
        if (callback) callback({ success: false, error: "Missing projectRequestId" });
        return;
      }

      // Strict Room Authorization
      const auth = await authorizeProjectRoomAccess(user, projectRequestId);
      if (!auth.authorized) {
        logger.warn(
          "UnauthorizedRoomJoinAttempt",
          `User ${user.id} denied access to project room: ${projectRequestId}`
        );
        socket.emit("error:unauthorized", {
          message: "You are not authorized to join this project conversation.",
        });
        if (callback) callback({ success: false, error: "Unauthorized" });
        return;
      }

      const roomName = `project:${projectRequestId}`;
      await socket.join(roomName);

      logger.info("SocketJoinedRoom", `User ${user.name} joined room ${roomName}`);
      socket.to(roomName).emit("user:joined", { userId: user.id, name: user.name });

      if (callback) {
        callback({
          success: true,
          projectTitle: auth.projectTitle,
          room: roomName,
        });
      }
    } catch (error) {
      logger.error("JoinProjectError", "Error joining project room", { error: String(error) });
      if (callback) callback({ success: false, error: "Failed to join room" });
    }
  });

  // Leave Project Room
  socket.on("leave:project", ({ projectRequestId }) => {
    if (projectRequestId) {
      const roomName = `project:${projectRequestId}`;
      socket.leave(roomName);
      socket.to(roomName).emit("user:left", { userId: user.id, name: user.name });
    }
  });

  // Send Message
  socket.on("message:send", async (data, callback) => {
    try {
      const { projectRequestId, content, attachmentUrl, attachmentName, attachmentSize, attachmentType } = data;

      if (!projectRequestId) {
        if (callback) callback({ success: false, error: "Missing projectRequestId" });
        return;
      }

      // Verify caller has room access
      const auth = await authorizeProjectRoomAccess(user, projectRequestId);
      if (!auth.authorized) {
        socket.emit("error:unauthorized", { message: "Unauthorized to send messages in this project" });
        if (callback) callback({ success: false, error: "Unauthorized" });
        return;
      }

      // Persist in PostgreSQL via chat service
      const message = await saveProjectMessage({
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        projectRequestId,
        content: content || "",
        attachmentUrl,
        attachmentName,
        attachmentSize,
        attachmentType,
      });

      const roomName = `project:${projectRequestId}`;
      // Broadcast to all participants in the room
      io.to(roomName).emit("message:new", message);

      if (callback) callback({ success: true, message });
    } catch (error: any) {
      logger.warn("SocketMessageSendError", error.message);
      if (callback) callback({ success: false, error: error.message || "Failed to send message" });
    }
  });

  // Mark Messages as Read
  socket.on("message:read", async ({ projectRequestId }, callback) => {
    try {
      if (!projectRequestId) return;

      const auth = await authorizeProjectRoomAccess(user, projectRequestId);
      if (!auth.authorized) return;

      const result = await markProjectMessagesRead(projectRequestId, user.id);

      const roomName = `project:${projectRequestId}`;
      io.to(roomName).emit("messages:read", {
        projectRequestId,
        readerId: user.id,
        readAt: result.readAt,
      });

      if (callback) callback({ success: true, count: result.count });
    } catch (error) {
      logger.error("SocketMessageReadError", "Failed to mark read", { error: String(error) });
      if (callback) callback({ success: false });
    }
  });

  // Typing Indicators
  socket.on("typing:start", ({ projectRequestId }) => {
    if (projectRequestId) {
      socket.to(`project:${projectRequestId}`).emit("typing:update", {
        userId: user.id,
        name: user.name,
        isTyping: true,
      });
    }
  });

  socket.on("typing:stop", ({ projectRequestId }) => {
    if (projectRequestId) {
      socket.to(`project:${projectRequestId}`).emit("typing:update", {
        userId: user.id,
        name: user.name,
        isTyping: false,
      });
    }
  });

  socket.on("disconnect", () => {
    logger.info("SocketDisconnected", `User disconnected: ${user.name} (${user.id})`);
  });
});

server.listen(PORT, () => {
  logger.info("RealtimeServerStarted", `Socket.IO Real-time chat server listening on port ${PORT}`);
});

export { server, io };
