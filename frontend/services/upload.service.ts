import { apiClient } from "@/services/api-client";

export const uploadService = {
  // Dipakai di Admin Panel (produk, banner, kategori, dll) — butuh akun admin.
  async uploadImage(file: File, folder: "banners" | "products" | "avatars" | "misc" = "misc") {
    const form = new FormData();
    form.append("file", file);

    const { data } = await apiClient.post(`/admin/uploads?folder=${folder}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as { url: string; path: string };
  },

  // Dipakai customer biasa (bukan admin) — dipakai untuk foto ulasan produk.
  async uploadCustomerImage(file: File, folder: "reviews" | "avatars" = "reviews") {
    const form = new FormData();
    form.append("file", file);

    const { data } = await apiClient.post(`/uploads?folder=${folder}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as { url: string; path: string };
  },
};
