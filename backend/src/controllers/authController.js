import prisma from "../db/client.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/hash.js";

export const register = async (req, res) => {
  const { email, password, name, adminKey } = req.body;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email already used" });

    const hashed = await hashPassword(password);

    let role = "USER";
    if (adminKey && adminKey === process.env.ADMIN_REGISTER_KEY) {
      role = "ADMIN";
    }

    const user = await prisma.user.create({
      data: { email, password: hashed, name, role }
    });

    // 🔥 създаваме token веднага, както при login:
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
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
        role: user.role   
      },
      process.env.JWT_SECRET,
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
  const fakeSuccessMessage = {
    message: "If this email exists, a reset link has been sent."
  };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Prevent attackers from checking which emails are valid
    if (!user) return res.json(fakeSuccessMessage);

    // TODO: send email here — for now we just simulate
    console.log("Password reset requested for:", email);

    return res.json(fakeSuccessMessage);
  } catch (err) {
    console.error(err);
    return res.json(fakeSuccessMessage); // still fake-success
  }
};

