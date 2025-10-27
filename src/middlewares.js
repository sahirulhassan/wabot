import multer from "multer";
import path from "path";
import fs from "fs";

export function errorHandlingMiddleware(err, req, res, next) {
  console.error(err.message, err.stack);
  return res
    .status(err.statusCode || 500)
    .json(err.userFriendlyError || "Internal Server Error.");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const dateTimeFolder = now
      .toISOString()
      .replace(/T/, "_") // turn '2025-10-27T13:45:22.000Z' → '2025-10-27_13:45:22.000Z'
      .replace(/:/g, "-") // remove colons → '2025-10-27_13-45-22.000Z'
      .split(".")[0]; // drop milliseconds

    const uploadPath = path.join("uploads", dateTimeFolder);
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ dest: "uploads/" });
