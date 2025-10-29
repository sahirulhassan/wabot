import client from "./client.js";
import AppError from "./AppError.js";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;
import fs from "fs";
import pLimit from "p-limit";
const limit = pLimit(5);

async function sleep() {
  const jitter = 6000 + Math.floor(Math.random() * 4000);
  return new Promise((resolve) => setTimeout(resolve, jitter));
}

async function sendWithOnlyMedia(numbers, media) {
  return Promise.allSettled(
    numbers.map((number) =>
      limit(async () => {
        for (const file of media) {
          await client.sendMessage(number, file);
          await sleep();
        }
        return number;
      }),
    ),
  );
}

async function sendWithOnlyMessage(numbers, message) {
  return Promise.allSettled(
    numbers.map((number) =>
      limit(async () => {
        await client.sendMessage(number, message);
        await sleep();
        return number;
      }),
    ),
  );
}

async function sendWithMessageAndOneMedia(numbers, message, media) {
  return Promise.allSettled(
    numbers.map((number) =>
      limit(async () => {
        await client.sendMessage(number, media, { caption: message });
        await sleep();
        return number;
      }),
    ),
  );
}

async function sendWithMessageAndMultipleMedia(numbers, message, media) {
  return Promise.allSettled(
    numbers.map((number) =>
      limit(async () => {
        for (const file of media) {
          await client.sendMessage(number, file);
          await sleep();
        }
        await client.sendMessage(number, message);
        return number;
      }),
    ),
  );
}

export async function sendMessages(numbers, payload) {
  if (!numbers) throw new AppError(400, "Please provide at least 1 number.");
  const regex = /^(?:[1-9]\d{6,14})(?:,\s*(?:[1-9]\d{6,14}))*$/;
  if (!regex.test(numbers)) throw new AppError(400, "Invalid number format.");
  if (client.state !== "Ready - You can start sending messages now.")
    throw new AppError(401, "Client not ready.");
  if (!(payload.message || payload.files))
    throw new AppError(400, "Please provide at least 1 message or 1 file.");

  numbers = numbers.split(",").map((n) => n.trim());

  const numberIds = await Promise.all(
    numbers.map(async (num) => {
      const id = await client.getNumberId(num);
      return id?._serialized;
    }),
  );
  const validNumbers = numberIds.filter(Boolean);
  if (!validNumbers.length)
    throw new AppError(400, "No valid WhatsApp numbers found.");

  // prepare files
  if (payload.files && payload.files.length > 0) {
    const fileResults = await Promise.allSettled(
      payload.files.map((f) => MessageMedia.fromFilePath(f.path)),
    );
    payload.files = fileResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
  } else {
    payload.files = [];
  }

  let results;
  if (payload.files.length === 0 && payload.message)
    results = await sendWithOnlyMessage(validNumbers, payload.message);
  else if (payload.files.length > 0 && !payload.message)
    results = await sendWithOnlyMedia(validNumbers, payload.files);
  else if (payload.files.length === 1 && payload.message)
    results = await sendWithMessageAndOneMedia(
      validNumbers,
      payload.message,
      payload.files[0],
    );
  else
    results = await sendWithMessageAndMultipleMedia(
      validNumbers,
      payload.message,
      payload.files,
    );

  fs.mkdirSync("logs", { recursive: true });
  fs.writeFileSync(
    `logs/${payload.timestamp}.json`,
    JSON.stringify(results, null, 2),
  );
}
