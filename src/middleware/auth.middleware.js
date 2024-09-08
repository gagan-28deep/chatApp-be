import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import prisma from "../db/db.js";

dotenv.config({
  path: "../../.env",
});

const authMiddleware = async (req, res, next) => {
  try {
    // const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    const token =
      req.cookies.jwt || req.headers?.authorization
    if (!token) {
      return res.status(401).json({ message: "Unauthorized Request" });
    }
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodeToken) {
      return res.status(401).json({ message: "Unauthorized Request" });
    }
    const user = await prisma.chatUser.findUnique({
      where: {
        id: decodeToken.userId,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Token mismatch" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized Request" });
  }
};

export default authMiddleware;
