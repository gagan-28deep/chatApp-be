import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "https://chat-app-fe-blond.vercel.app",
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket?.id;
  }

  // io.emit is used to send events to all connected users
  io.emit("getonlineusers", Object.keys(userSocketMap));

  // socket.on is used to listen to the events , it can be used both on server and client side
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getonlineusers", Object.keys(userSocketMap));
  });
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export { io, server, app };
