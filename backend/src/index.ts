import cors from "cors";
import dotenv from "dotenv";
import express from "express";

// Routes
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import ecRoutes from "./routes/ec.routes.js";
import publicRoutes from "./routes/public.routes.js";
import voterRoutes from "./routes/voter.routes.js";

// Middleware
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5555",
      "https://web.rotoon.dev",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ec", ecRoutes);
app.use("/api/voter", voterRoutes);
app.use("/api/public", publicRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

export default app;
