import express from "express";
import {
  signUp,
  signIn,
  getUser,
  logout,
  getAllUsers,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(signIn);
router.route("/getAll").get(getAllUsers);

// Protected routes
router.route("/").get(authMiddleware, getUser);
router.route("/").post(authMiddleware, logout);

export default router;
