import express from "express";
import {
  signUp,
  signIn,
  getUser,
  logout,
  getAllUsers,
  generateRefreshToken,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(signIn);
router.route("/getAll").get(getAllUsers);
router.route("/refresh-token").post(generateRefreshToken);

// Protected routes
router.route("/me").get(authMiddleware, getUser);
router.route("/logout").post(authMiddleware, logout);

export default router;
