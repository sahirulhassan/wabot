import client from "./client.js";
import AppError from "./AppError.js";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;
import fs from "fs";
import pLimit from "p-limit";
const limit = pLimit(5);

export async function sendToNumber(number, payload) {
  const id = await client.getNumberId(number);
  if (!id) return false;
  else if (payload.message && !payload.files) {
    await client.sendMessage(id._serialized, payload.message);
    return true;
  } else if (payload.files.length > 1 && !payload.message) {
    const results = await Promise.allSettled(
      payload.files.map((file) =>
        limit(() => client.sendMessage(id._serialized, file)),
      ),
    );
    return true;
  } else if (!payload.message && payload.files.length === 1) {
    await client.sendMessage(id._serialized, payload.files[0]);
    return true;
  } else if (payload.message && payload.files.length === 1) {
    await client.sendMessage(id._serialized, payload.files[0], {
      caption: payload.message,
    });
    return true;
  } else if (payload.message && payload.files.length > 1) {
    const results = await Promise.allSettled(
      payload.files.map((file) =>
        limit(() => client.sendMessage(id._serialized, file)),
      ),
    );
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
    payload.files = await Promise.all(
      payload.files.map((f) => MessageMedia.fromFilePath(f.path)),
    );
  //let log = {};
  const results = await Promise.allSettled(
    numbers.map((num) => limit(() => sendToNumber(num, payload))),
  );
  // for (const number of numbers) {
  //   const sent = await sendToNumber(number, payload);
  //   log[number] = sent ? "Sent" : "Failed";
  //   await sleep();
  // }
  fs.mkdirSync("logs/", { recursive: true });
  fs.writeFileSync(
    `logs/${payload.timestamp}.json`,
    JSON.stringify(results, null, 2),
  );
}
