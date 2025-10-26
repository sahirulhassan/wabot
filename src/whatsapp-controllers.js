import client from "./client.js";
import qrcode from "qrcode";
import AppError from "./utils/AppError.js";

export async function handleGetStatus(req, res) {
  res.status(200).json({ state: client.state });
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
  await client.logout();
  client.state = "Logged out. Restarting";
  client.qr = null;
  res.status(204).json({ message: "Logged out successfully" });
  client.initialize();
}
