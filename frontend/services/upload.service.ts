import { apiClient } from "@/services/api-client";

export const uploadService = {
  async uploadImage(file: File, folder: "banners" | "products" | "avatars" | "misc" | "reviews" = "misc") {
    const form = new FormData();
    form.append("file", file);

    // Folder "reviews" dipakai customer biasa (bukan admin) — lewat endpoint
    // /uploads (requireAuth), bukan /admin/uploads (requireAdmin).
    const basePath = folder === "reviews" ? "/uploads" : "/admin/uploads";

    const { data } = await apiClient.post(`${basePath}?folder=${folder}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as { url: string; path: string };
  },
};
