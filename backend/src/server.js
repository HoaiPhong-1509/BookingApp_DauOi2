import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { startAutoNoShowJob } from "./jobs/autoNoShowBookings.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;
const stopAutoNoShow = startAutoNoShowJob(5 * 60 * 1000);

const server = app.listen(PORT, () => {
  console.log(`Server đang chạy ở port ${PORT}`);
});

process.on('SIGINT', () => {
  stopAutoNoShow();
  server.close(() => process.exit(0));
});