import client from "./client.js";
import qrcode from "qrcode";
import AppError from "./utils/AppError.js";

export async function handleGetStatus(req, res) {
  const altState = await client.getState();
  res.status(200).json({ state: client.state, altState });
}

export async function handleGetQRCode(req, res) {
  if (!client.qr) {
    throw new AppError(404, "QR code not available.");
  }
  let qrBuffer = null;
  try {
    qrBuffer = await qrcode.toBuffer(client.qr, { type: "png" }); // Store the buffer
  } catch (err) {
    throw new AppError(500, "Failed to generate QR code PNG Buffer.", err);
  }
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", qrBuffer.length);
  res.status(200).send(qrBuffer);
}

export async function handleLogout(req, res) {
  await client.logout();
  res.status(204).json({ message: "Logged out successfully" });
}
