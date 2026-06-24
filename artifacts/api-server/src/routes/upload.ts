import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";
const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const cloudinaryConfigured = Boolean(
  CLOUDINARY_URL ||
    (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET),
);

if (!cloudinaryConfigured) {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

if (CLOUDINARY_URL) {
  cloudinary.config({ secure: true, url: CLOUDINARY_URL });
} else if (cloudinaryConfigured) {
  cloudinary.config({
    secure: true,
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

const storage = cloudinaryConfigured
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post("/upload", authMiddleware, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No se recibió ningún archivo" });
    return;
  }

  if (cloudinaryConfigured) {
    if (!req.file.buffer) {
      res.status(500).json({ error: "No se pudo leer el archivo para subirlo" });
      return;
    }

    try {
      const uploadResult = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "asset-manager", resource_type: "auto" },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("Cloudinary no devolvió resultado"));
            resolve(result);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      res.json({ url: uploadResult.secure_url || uploadResult.url });
      return;
    } catch (error) {
      res.status(500).json({ error: "Error subiendo el archivo a Cloudinary" });
      return;
    }
  }

  const url = `/api/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
