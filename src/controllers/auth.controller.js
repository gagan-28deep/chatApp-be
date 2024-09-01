import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import bcrypt from "bcryptjs";

import prisma from "../db/db.js";

import generateToken from "../utils/generateToken.js";

// Error handling response
const handleErrorResponse = (res, error) => {
  return res.status(error?.statusCode).json({
    statusCode: error.statusCode,
    message: error?.message,
  });
};

// Sign Up
export const signUp = asyncHandler(async (req, res) => {
  const { username, fullName, password, confirmPassword, gender } = req.body;

  if (!username || !fullName || !password || !confirmPassword || !gender) {
    const error = new ApiError(400, "All fields are required");
    return handleErrorResponse(res, error);
  }
  if (password !== confirmPassword) {
    const error = new ApiError(400, "Passwords do not match");
    return handleErrorResponse(res, error);
  }

  const existingUser = await prisma.chatUser.findUnique({
    where: {
      username,
    },
  });
  if (existingUser) {
    const error = new ApiError(400, "Username already exists");
    return handleErrorResponse(res, error);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
  const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

  const newUser = await prisma.chatUser.create({
    data: {
      fullname: fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
    },
  });

  if (!newUser) {
    const error = new ApiError(500, "Something went wrong while creating user");
    return handleErrorResponse(res, error);
  }

  if (newUser) {
    // generate a access token
    generateToken(newUser?.id, res);
    res
      .status(200)
      .json(new ApiResponse(200, newUser, "User created successfully"));
  }
});

// Sign In
export const signIn = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const error = new ApiError(400, "All fields are required");
    return handleErrorResponse(res, error);
  }
  const user = await prisma.chatUser.findUnique({
    where: {
      username,
    },
  });
  if (!user) {
    const error = new ApiError(404, "User not found");
    return handleErrorResponse(res, error);
  }
  const isMatch = await bcrypt.compare(password, user?.password);
  if (!isMatch) {
    const error = new ApiError(400, "Invalid credentials");
    return handleErrorResponse(res, error);
  }
  generateToken(user?.id, res);
  res
    .status(200)
    .json(new ApiResponse(200, user, "User logged in successfully"));
});

// Get User

export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.chatUser.findUnique({
    where: {
      id: req.user.id,
    },
  });
  if (!user) {
    const error = new ApiError(404, "User not found");
    return handleErrorResponse(res, error);
  }
  res.status(200).json(new ApiResponse(200, user, "User found successfully"));
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("jwt");
  res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.chatUser.findMany();
  res.status(200).json(new ApiResponse(200, users, "Users found successfully"));
});
