import client from "./client.js";
import AppError from "./AppError.js";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;

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

export async function sendMessages(numbers, payload) {
  if (client.state !== "ready") throw new AppError(401, "Client not ready.");
  if (!(payload.message || payload.files))
    throw new AppError(400, "Please provide at least 1 message or 1 file.");
  if (payload.files)
    payload.files = payload.files.map(
      async (f) => await MessageMedia.fromFilePath(f.path),
    );
  let sentLog = { name: payload.files[0].destination.split("/")[1], log: {} };
  for (const number of numbers) {
    const sent = await sendToNumber(number, payload);
    sentLog.log[number] = sent ? "Sent" : "Failed";
  }
  return sentLog;
}
