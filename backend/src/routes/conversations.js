import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

/**
 * GET all conversations
 * - Admin: Gets all conversations
 * - User: Gets only their own conversations
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const isAdminUser = req.user.role === "ADMIN";

    const where = isAdminUser ? {} : { userId: req.user.id };

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform to include last message and unread info
    const result = conversations.map((conv) => ({
      ...conv,
      lastMessage: conv.messages[0] || null,
      messageCount: conv._count.messages,
      messages: undefined,
      _count: undefined,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/**
 * GET single conversation with all messages
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const isAdminUser = req.user.role === "ADMIN";

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check authorization - user can only see their own conversations
    if (!isAdminUser && conversation.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(conversation);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

/**
 * POST create a new conversation (user only)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Subject and message are required" });
    }

    const conversation = await prisma.conversation.create({
      data: {
        subject,
        userId: req.user.id,
        messages: {
          create: {
            content: message,
            senderId: req.user.id,
            isFromAdmin: false,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    res.json(conversation);
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

/**
 * POST send a message in a conversation
 */
router.post("/:id/messages", authMiddleware, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const { content } = req.body;
    const isAdminUser = req.user.role === "ADMIN";

    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Check if conversation exists and user has access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!isAdminUser && conversation.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (conversation.status === "Closed") {
      return res.status(400).json({ error: "Conversation is closed" });
    }

    // Create the message and update conversation's updatedAt
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: req.user.id,
        isFromAdmin: isAdminUser,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * PATCH close a conversation (admin only)
 */
router.patch("/:id/close", authMiddleware, isAdmin, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);

    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: "Closed" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(conversation);
  } catch (err) {
    console.error("Error closing conversation:", err);
    res.status(500).json({ error: "Failed to close conversation" });
  }
});

/**
 * PATCH reopen a conversation (admin only)
 */
router.patch("/:id/reopen", authMiddleware, isAdmin, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);

    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: "Open" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(conversation);
  } catch (err) {
    console.error("Error reopening conversation:", err);
    res.status(500).json({ error: "Failed to reopen conversation" });
  }
});

export default router;
