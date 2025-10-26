import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import errorHandler from "./middleware/error-handling-middleware.js";
import {
  handleGetQRCode,
  handleGetStatus,
  handleLogout,
} from "./whatsapp-controllers.js";
import client from "./client.js";

dotenv.config();
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.get("/status", handleGetStatus);
app.get("/qr", handleGetQRCode);
app.delete("/logout", handleLogout);
app.use(errorHandler);

await client.initialize();
const server = app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`),
);

async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down...`);
  server.close(async (err) => {
    if (err) {
      console.error("Error closing server:", err);
      process.exit(1);
    }
    await client.destroy();
    console.log("Shutdown complete.");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
