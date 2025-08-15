import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { sequelize, User } from "./models/index.js";
import app from "./app.js";
import { initializeSocket } from "./socket.js";

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    await sequelize.sync();
    console.log("🔄 Database synchronized.");

    // Create admin if not exist
    const adminEmail = "admin@student.sust.edu";
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        phone: "01712345678",
        department: "CSE",
        season: "Fall 2021",
        password: "12345678",
        role: "admin",
      });
      console.log("🛠️ Admin user created:", `${adminEmail} / 12345678`);
    }

    const server = createServer(app);

    // Setup socket
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
}

// Add this after your routes
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

startServer();
