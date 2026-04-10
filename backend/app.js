const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/postRoutes");
const profileRoutes = require("./routes/profile");
const userRoutes = require("./routes/userRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const globalErrorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

app.use(helmet()); // Security headers

// Allowed origins: local dev + production frontend URL from env
const allowedOrigins = [
  "http://127.0.0.1:5180",
  "http://localhost:5180",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const err = new Error("Not allowed by CORS");
        err.statusCode = 403;
        callback(err);
      }
    },
    credentials: true,
    exposedHeaders: ["set-cookie"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: '10kb' })); // Parse JSON, cap body at 10kb to prevent abuse
app.use(cookieParser()); // to read cookies effectively

// Serve static files BEFORE routes (with CORS headers)
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow all origins for images
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);
console.log("✅ Static uploads folder served at /uploads");

// Routes
app.use("/api/auth", authRoutes); // Public (register/login)
app.use("/api/posts", postRoutes); // Partially protected in postRoutes.js
app.use("/api/profile", profileRoutes); // Protected
console.log("✅ Profile routes registered at /api/profile");
app.use("/api/user", userRoutes); // User management routes
console.log("✅ User routes registered at /api/user");
app.use("/api/search", searchRoutes); // Search routes
console.log("✅ Search routes registered at /api/search");
app.use("/api/notifications", notificationRoutes); // Notification routes
console.log("✅ Notification routes registered at /api/notifications");

// Health check endpoint for Docker, CI/CD, load balancers
app.get("/health", (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    status: "OK",
    timestamp: Date.now(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  };
  res.status(200).json(healthcheck);
});
console.log("✅ Health endpoint registered at /health");

// Globally handle errors
app.use(globalErrorHandler);

module.exports = app;