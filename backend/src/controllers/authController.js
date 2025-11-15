import prisma from "../db/client.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/hash.js";

export const register = async (req, res) => {

  const { email, password, name, adminKey } = req.body;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email already used" });

    const hashed = await hashPassword(password);

    // Избор на роля
    let role = "USER";

    if (adminKey && adminKey === process.env.ADMIN_REGISTER_KEY) {
      role = "ADMIN";
    }

    const user = await prisma.user.create({
      data: { email, password: hashed, name, role }
    });

    res.json({ message: "Registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
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
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
