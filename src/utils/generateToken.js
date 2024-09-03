import jwt from "jsonwebtoken";

import dotenv from "dotenv";
import prisma from "../db/db.js";

dotenv.config({
  path: "../../.env",
});

// Generate Access And Refresh Token
const generateToken = async (userId, res) => {
  const user = await prisma.chatUser.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  const refreshToken = jwt.sign(
    { userId, email: user?.email, username: user?.username },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  res.cookie("jwt", accessToken, {
    maxAge: 10 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return {
    accessToken,
    refreshToken,
  };
};

export default generateToken;
