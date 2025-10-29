import client from "./client.js";
import qrcode from "qrcode";
import AppError from "./AppError.js";
import { logout, sendMessages } from "./whatsapp-services.js";

export async function handleGetStatus(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (msg) => res.write(`data: ${msg}\n\n`);

  send("Connected to server");

  const interval = setInterval(() => {
    send(client.state);
  }, 3000);

  req.on("close", () => clearInterval(interval));
}

export async function handleGetQRCode(req, res) {
  if (!client.qr) {
    throw new AppError(
      404,
      "QR code not yet available. Please try again later.",
    );
  }
  let qrBuffer = null;
  try {
    qrBuffer = await qrcode.toBuffer(client.qr, { type: "png" });
  } catch (err) {
    throw new AppError(500, "Failed to generate QR code PNG Buffer.", err);
  }
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", qrBuffer.length);
  res.status(200).send(qrBuffer);
}

export async function handleLogout(req, res) {
  await logout();
  res.status(204).json({ message: "Logged out successfully" });
}

export async function handleMessageSending(req, res) {
  const numbers = req.body.numbers;
  const message = req.body.message;
  const files = req.files;
  const timestamp = req.timestamp;
  sendMessages(numbers, { message, files, timestamp });
  res.status(202).json({
    message:
      "Request received. Please wait while messages are sent. See log for details.",
  });
}
