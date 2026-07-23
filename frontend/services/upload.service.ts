import { apiClient } from "@/services/api-client";

// Folder yang boleh diupload CUSTOMER biasa (lewat /uploads, requireAuth) —
// harus sinkron dengan ALLOWED_CUSTOMER_FOLDERS di backend upload.routes.ts.
// Folder lain (banners, products, misc) cuma boleh admin, lewat /admin/uploads.
const CUSTOMER_FOLDERS = new Set(["reviews", "avatars"]);

export const uploadService = {
  async uploadImage(file: File, folder: "banners" | "products" | "avatars" | "misc" | "reviews" = "misc") {
    const form = new FormData();
    form.append("file", file);

    const basePath = CUSTOMER_FOLDERS.has(folder) ? "/uploads" : "/admin/uploads";

    const { data } = await apiClient.post(`${basePath}?folder=${folder}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as { url: string; path: string };
  },
};
