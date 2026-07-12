import { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";

/**
 * Optional auth: jika header Authorization berisi Bearer token yang valid,
 * req.user akan terisi. Jika tidak ada / tidak valid, request tetap
 * dilanjutkan tanpa req.user (mendukung guest checkout).
 *
 * Route yang WAJIB login (mis. order history, profile) harus memakai
 * `requireAuth` di bawah, bukan `optionalAuth`.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();

  const token = authHeader.split(" ")[1];
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data.user) {
      req.user = { authId: data.user.id, email: data.user.email ?? "" };
    }
  } catch {
    // Token tidak valid — biarkan lolos sebagai guest, jangan block request.
  }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Anda harus login untuk mengakses ini" });
  }

  const token = authHeader.split(" ")[1];
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ success: false, message: "Sesi login tidak valid, silakan login kembali" });
  }

  req.user = { authId: data.user.id, email: data.user.email ?? "" };
  next();
}

/**
 * Middleware khusus Admin Panel: verifikasi JWT lalu pastikan auth_id-nya
 * terdaftar di tabel `admins` (bukan sekadar user biasa). Menyisipkan
 * req.admin berisi id & role (admin/super_admin) untuk dipakai controller,
 * misalnya membatasi CRUD Admin hanya untuk role super_admin.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Anda harus login sebagai admin" });
  }

  const token = authHeader.split(" ")[1];
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ success: false, message: "Sesi login tidak valid, silakan login kembali" });
  }

  const { data: admin } = await supabaseAdmin
    .from("admins")
    .select("id, role, is_active")
    .eq("auth_id", data.user.id)
    .maybeSingle();

  if (!admin || !admin.is_active) {
    return res.status(403).json({ success: false, message: "Akun ini tidak memiliki akses Admin Panel" });
  }

  req.user = { authId: data.user.id, email: data.user.email ?? "" };
  req.admin = { id: admin.id, role: admin.role };
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.admin?.role !== "super_admin") {
    return res.status(403).json({ success: false, message: "Hanya Super Admin yang bisa mengakses ini" });
  }
  next();
}
