import client from "./client.js";
import AppError from "./AppError.js";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;
import joi from "joi";

export async function sendToNumber(number, payload) {
  const id = await client.getNumberId(number);
  if (!id) return false;
  else if (payload.message && !payload.files) {
    await client.sendMessage(id._serialized, payload.message);
    return true;
  } else if (payload.files && !payload.message) {
    await client.sendMessage(id._serialized, undefined, {
      media: payload.files,
    });
    return true;
  } else if (payload.message && payload.files.length === 1) {
    await client.sendMessage(id._serialized, payload.files[0], {
      caption: payload.message,
    });
    return true;
  } else if (payload.message && payload.files.length > 1) {
    await client.sendMessage(id._serialized, undefined, {
      media: payload.files,
    });
    await client.sendMessage(id._serialized, payload.message);
    return true;
  }
}

async function sleep() {
  const jitter = 6000 + Math.floor(Math.random() * 4000);
  return new Promise((resolve) => setTimeout(resolve, jitter));
}

export async function sendMessages(numbers, payload) {
  if (!numbers) throw new AppError(400, "Please provide at least 1 number.");
  numbers = numbers.split(",").map((n) => n.trim());
  if (client.state !== "Ready - You can start sending messages now.")
    throw new AppError(401, "Client not ready.");
  if (!(payload.message || payload.files))
    throw new AppError(400, "Please provide at least 1 message or 1 file.");
  if (payload.files)
    payload.files = payload.files.map(
      async (f) => await MessageMedia.fromFilePath(f.path),
    );
  let log = {};
  for (const number of numbers) {
    const sent = await sendToNumber(number, payload);
    log[number] = sent ? "Sent" : "Failed";
    await sleep();
  }
  return log;
}

const payloadSchema = joi.object({
  number: joi
    .string()
    .pattern(/^\+[1-9]\d{9,14}$/)
    .message("Phone must be in international format, e.g. +1234567890"),
});
