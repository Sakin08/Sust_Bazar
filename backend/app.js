import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./routes/products.js";
import chatRoutes from "./routes/chats.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import accommodationRoutes from "./routes/accommodation.js";
import communityRoutes from "./routes/communityRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes

app.use("/api/products", productRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/accommodations", accommodationRoutes);
app.use("/api/community", communityRoutes);

// Add this before your error handling middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Update your error handling middleware
app.use((error, req, res, next) => {
  console.error("Error details:", error);
  if (error.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ message: "File size too large. Maximum size is 5MB." });
  }
  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({ message: error.message });
  }
  console.error("Server error:", error);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

export default app;
