import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getRedisClient } from "./config/redis.js";
import assignmentRoutes from "./routes/assignment.route.js";
import attendanceRoutes from "./routes/attendance.route.js";
import authRoutes from "./routes/auth.route.js";
import examRoutes from "./routes/exams.route.js";
import { verifyEmailService } from "./services/email.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server/.env (one folder up from src)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// Log to verify values are loaded correctly
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'MISSING');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/assignments", assignmentRoutes);

// Create and connect Redis client after dotenv has loaded env vars
const redisClient = getRedisClient();
await redisClient.connect();

// Verify email service
await verifyEmailService();

console.log('PORT:', process.env.PORT);

app.get("/", (req, res) => {
  res.send("Kelp Backend is running");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
