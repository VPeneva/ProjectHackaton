import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";
import institutionRoutes from "./routes/institutions.js";
import categoryRoutes from "./routes/categories.js"; // <<< ДОБАВЕНО

import contactRoutes from "./routes/contact.js";




const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/categories", categoryRoutes); // <<< ДОБАВЕНО
app.use("/api/contact", contactRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
