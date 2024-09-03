import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getMessage,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/conversations", getUsersForSidebar);
router.route("/send/:id", sendMessage);
router.route("/get/:id", getMessage);

export default router;
