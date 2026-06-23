import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { startAutoNoShowJob } from "./jobs/autoNoShowBookings.js";
import { startBookingHistoryCleanupJob } from "./jobs/cleanupBookingHistory.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;
const stopAutoNoShow = startAutoNoShowJob(5 * 60 * 1000);
const stopBookingHistoryCleanup = startBookingHistoryCleanupJob();

const server = app.listen(PORT, () => {
  console.log(`Server đang chạy ở port ${PORT}`);
});

server.on('error', (error) => {
  stopAutoNoShow();
  stopBookingHistoryCleanup();
  console.error(`Không thể khởi động server ở port ${PORT}:`, error.message);
  process.exit(1);
});

const shutdown = () => {
  stopAutoNoShow();
  stopBookingHistoryCleanup();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
