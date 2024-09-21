import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket?.id;
  }

  // io.emit is used to send events to all connected users
  io.emit("getonlineusers", Object.keys(userSocketMap));

  // socket.on is used to listen to the events , it can be used both on server and client side
  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
    delete userSocketMap[userId];
    io.emit("getonlineusers", Object.keys(userSocketMap));
  });
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Auth Routes
import authRoutes from "../routes/auth.routes.js";

// Message Routes
import messageRoutes from "../routes/message.routes.js";

export { io, server, app };
