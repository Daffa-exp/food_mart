import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "../../config/supabase";
import { env } from "../../config/env";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      cb(new AppError("Format gambar harus JPG, PNG, WEBP, atau GIF", 400));
      return;
    }
    cb(null, true);
  },
});

let bucketReadyChecked = false;

async function ensureBucketExists() {
  if (bucketReadyChecked) return;

  const { error: getError } = await supabaseAdmin.storage.getBucket(env.SUPABASE_STORAGE_BUCKET);

  if (getError) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(env.SUPABASE_STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: "5MB",
    });
    if (createError && !/already exists/i.test(createError.message)) {
      throw new AppError(
        `Gagal menyiapkan storage bucket "${env.SUPABASE_STORAGE_BUCKET}": ${createError.message}. ` +
          `Pastikan SUPABASE_SERVICE_ROLE_KEY di backend .env benar (bukan anon key).`,
        500
      );
    }
  }

  bucketReadyChecked = true;
}

const router = Router();
router.use(requireAdmin);

router.post("/", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError("File gambar tidak ditemukan", 400);

    await ensureBucketExists();

    const folder = (req.query.folder as string) || "misc";
    const safeFolder = folder.replace(/[^a-z0-9_-]/gi, "");
    const ext = (req.file.originalname.split(".").pop() || "jpg").toLowerCase();
    const path = `${safeFolder}/${Date.now()}-${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

    if (uploadError) {
      if (/bucket not found/i.test(uploadError.message)) bucketReadyChecked = false;
      throw new AppError(`Gagal upload gambar: ${uploadError.message}`, 500);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(path);

    res.status(201).json({
      success: true,
      message: "Gambar berhasil diupload",
      data: { url: publicUrlData.publicUrl, path },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
