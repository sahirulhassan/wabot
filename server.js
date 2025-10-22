import express from "express";
import { PubSub } from "@google-cloud/pubsub";
import { Storage } from "@google-cloud/storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";


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

const pubsub = new PubSub();
const storage = new Storage();
const bucketName = process.env.BUCKET_NAME;
const topicName = process.env.TOPIC_NAME;
const upload = multer({ dest: "/tmp" });

// Upload CSV for bulk sending
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const filePath = req.file.path;
        const destFileName = `uploads/${path.basename(req.file.originalname)}`;
        await storage.bucket(bucketName).upload(filePath, {
            destination: destFileName,
        });
        await fs.unlink(filePath);
        res.json({ message: "File uploaded", file: destFileName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});

// Queue message sending
app.post("/send", async (req, res) => {
    try {
        const { number, text, mediaUrl } = req.body;
        if (!number || !text) {
            return res.status(400).json({ error: "number and text are required" });
        }

        const dataBuffer = Buffer.from(JSON.stringify({ number, text, mediaUrl }));
        await pubsub.topic(topicName).publishMessage({ data: dataBuffer });

        res.json({ message: "Message queued for sending" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to publish message" });
    }
});

// Generate QR (trigger WhatsApp auth)
app.get("/qr", async (req, res) => {
    try {
        // Assume worker generates a QR and uploads it to GCS as qr.png
        const file = storage.bucket(bucketName).file("qr.png");
        const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 10 * 60 * 1000,
        });
        res.json({ qrUrl: url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch QR" });
    }
});

// Health check
app.get("/", (req, res) => {
    res.send("WhatsApp Automation API is alive");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
