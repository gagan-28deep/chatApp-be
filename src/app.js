import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
// Auth Routes
import authRoutes from "./routes/auth.routes.js";

// Message Routes
import messageRoutes from "./routes/message.routes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);
