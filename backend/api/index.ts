// Entry point khusus Vercel. Vercel menjalankan tiap file di /api sebagai
// serverless function terpisah — BUKAN server yang nyala terus kayak
// app.listen() di src/server.ts (itu dipakai kalau hosting di Render/VPS).
// Di sini kita cukup export Express app apa adanya; Vercel yang urus
// bagian "nyalain server"-nya per-request.
import app from "../src/app";

export default app;
