// import { app } from "./src/app.js";
import cookieParser from "cookie-parser";
import {server , app} from "./src/socket/socket.js"
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
// Auth routes
import authRoutes from "./src/routes/auth.routes.js";

// Message routes
import messageRoutes from "./src/routes/message.routes.js";

dotenv.config({
  path: "./.env",
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  // origin: "https://chat-app-fe-blond.vercel.app",
  origin: "*",
}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log("Server started on port 8000");
});
