import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import assignmentRoutes from "./routes/assignment.route.js";
import attendanceRoutes from "./routes/attendance.route.js";
import authRoutes from "./routes/auth.route.js";
import examRoutes from "./routes/exams.route.js";
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/assignments", assignmentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
