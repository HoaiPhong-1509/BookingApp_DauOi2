import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

const apiRateLimitMax = Math.max(100, Number(process.env.API_RATE_LIMIT_MAX || 2000));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: apiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Hệ thống đang nhận quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
    code: "API_RATE_LIMITED",
    errors: [],
  },
});

app.use(helmet());
app.use(limiter);
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,        // URL Vercel production
].filter(Boolean)                // loại bỏ giá trị undefined

console.log("Allowed origins:", allowedOrigins)

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (Postman, mobile app,...)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS blocked: ${origin}`))
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
)

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/branches", branchRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
