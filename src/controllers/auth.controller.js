import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import prisma from "../db/db.js";

import generateToken from "../utils/generateToken.js";

dotenv.config({
  path: "../../.env",
});

// Error handling response
const handleErrorResponse = (res, error) => {
  return res.status(error?.status).json({
    statusCode: error.status,
    message: error?.message,
  });
};

// Sign Up
export const signUp = asyncHandler(async (req, res) => {
  const { username, fullName, password, confirmPassword, gender, email } =
    req.body;

  if (!username || !fullName || !password || !confirmPassword || !gender) {
    const error = new ApiError(400, "All fields are required");
    return handleErrorResponse(res, error);
  }
  if (password !== confirmPassword) {
    const error = new ApiError(400, "Passwords do not match");
    return handleErrorResponse(res, error);
  }

  // Cehck if the existing user exists with same username or email
  const existingUser = await prisma.chatUser.findFirst({
    where: {
      OR: [
        {
          username,
        },
        {
          email,
        },
      ],
    },
  });
  if (existingUser) {
    const error = new ApiError(400, "Username or email already exists");
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
      email,
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
    const { accessToken, refreshToken } = await generateToken(newUser?.id, res);
    // Set the refresh Token in the database
    const loggedInUser = await prisma.chatUser.update({
      where: {
        id: newUser?.id,
      },
      data: {
        refreshToken,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { loggedInUser, accessToken, refreshToken },
          "User created successfully"
        )
      );
  }
});

// Sign In
export const signIn = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const error = new ApiError(400, "All fields are required");
    return handleErrorResponse(res, error);
  }
  const user = await prisma.chatUser.findFirst({
    where: {
      OR : [
        {
          username
        },
        {
          email: username
        }
      ]
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
  const { accessToken, refreshToken } = await generateToken(user?.id, res);

  const loggedInUser = await prisma.chatUser.update({
    where: {
      id: user?.id,
    },
    data: {
      refreshToken,
    },
  });
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
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
  res.clearCookie("refreshToken");
  const user = prisma.chatUser.update({
    where: {
      id: req.user.id,
    },
    data: {
      refreshToken: null,
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.chatUser.findMany();
  res.status(200).json(new ApiResponse(200, users, "Users found successfully"));
});

// Generate Refresh Token
export const generateRefreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    const error = new ApiError(401, "Unauthorized");
    return handleErrorResponse(res, error);
  }
  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN
    );
    const user = await prisma.chatUser.findUnique({
      where: {
        id: decodedToken?.userId,
      },
    });
    if (!user) {
      const error = new ApiError(401, "Invalid token");
      return handleErrorResponse(res, error);
    }
    const { accessToken, refreshToken } = await generateToken(user?.id, res);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Refresh token generated successfully"
        )
      );
  } catch (err) {
    const error = new ApiError(401, "Unauthorized request");
    return handleErrorResponse(res, error);
  }
});
