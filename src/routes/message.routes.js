import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getMessage,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/conversations").get(getUsersForSidebar);
router.route("/send/:id").post(sendMessage);
router.route("/get/:id").get(getMessage);

export default router;
