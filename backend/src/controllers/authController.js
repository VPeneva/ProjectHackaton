import prisma from "../db/client.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { config } from "../config.js";

const RESET_TOKEN_TTL_MINUTES = config.RESET_TOKEN_TTL_MINUTES;

export const register = async (req, res) => {
  const { email, password, name, adminKey } = req.body;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email already used" });

    const hashed = await hashPassword(password);

    let role = "USER";
    if (adminKey && adminKey === config.ADMIN_REGISTER_KEY) {
      role = "ADMIN";
    }

    const user = await prisma.user.create({
      data: { email, password: hashed, name, role }
    });

    // 🔥 създаваме token веднага, както при login:
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId || null,
      },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Registered successfully",
      user,
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId || null,
      },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // SECURITY: Always return success to avoid email enumeration
  const responseMessage = {
    message: "If this email exists, a reset link has been sent."
  };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Prevent attackers from checking which emails are valid
    if (!user) return res.json(responseMessage);

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const shouldExposeToken = config.EXPOSE_RESET_TOKEN || config.NODE_ENV !== "production";
    if (shouldExposeToken) {
      return res.json({
        ...responseMessage,
        resetToken: rawToken,
        resetUrl: `/reset-password?token=${rawToken}`,
      });
    }

    return res.json(responseMessage);
  } catch (err) {
    console.error(err);
    return res.json(responseMessage); // still fake-success
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const hashed = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", message: err.message });
  }
};
