import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import prisma from "../db/db.js";

const handleErrorResponse = (res, error) => {
  return res.status(error?.statusCode).json({
    statusCode: error.statusCode,
    message: error?.message,
  });
};

// Send Message
export const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { id: recieverId } = req.params;
  const senderId = req.user.id;

  let conversation = await prisma.conversation.findFirst({
    where: {
      participantIds: {
        hasEvery: [senderId, recieverId],
      },
    },
  });
  //   Very first message
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participantIds: {
          set: [senderId, recieverId],
        },
      },
    });
  }
  //   If conversation is there , and we want to send a message
  const newMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      message,
    },
  });
  if (newMessage) {
    conversation = await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
    });
  }
  res
    .status(200)
    .json(new ApiResponse(200, newMessage, "Message sent successfully"));
});

// Get Message

export const getMessage = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const senderId = req.user.id;

  const conversation = await prisma.conversation.findFirst({
    where: {
      participantIds: {
        hasEvery: [senderId, userToChatId],
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
  if (!conversation) {
    const error = new ApiError(404, "Conversation not found");
    return handleErrorResponse(res, error);
  }

  res
    .status(200)
    .json(new ApiResponse(200, conversation, "Conversation found"));
});

// Get Users For Sidebar

export const getUsersForSidebar = asyncHandler(async (req, res) => {
  const authUserId = req.user.id;
  const users = await prisma.chatUser.findMany({
    where: {
      id: {
        not: authUserId,
      },
    },
    select: {
      id: true,
      fullname: true,
      profilePic: true,
    },
  });
  res.status(200).json(new ApiResponse(200, users, "Users found successfully"));
});
