import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}

/**
 * Mengubah ZodError jadi pesan yang enak dibaca, mis:
 * "imageUrl: URL gambar tidak valid; price: Harga harus lebih dari 0"
 * Sebelum ada fungsi ini, ZodError jatuh ke cabang generik di bawah dan
 * selalu tampil sebagai "Terjadi kesalahan pada server" — pesan validasi
 * aslinya (yang justru paling dibutuhkan admin) tidak pernah terlihat.
 */
function formatZodError(err: ZodError): string {
  return err.errors
    .map((e) => {
      const field = e.path.join(".");
      return field ? `${field}: ${e.message}` : e.message;
    })
    .join("; ");
}

export function globalErrorHandler(
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: formatZodError(err),
      errors: err.errors,
    });
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "Terjadi kesalahan pada server";

  if (statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error("[UNHANDLED ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
