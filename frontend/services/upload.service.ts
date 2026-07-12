import { apiClient } from "@/services/api-client";

export const uploadService = {
  async uploadImage(file: File, folder: "banners" | "products" | "avatars" | "misc" = "misc") {
    const form = new FormData();
    form.append("file", file);

    const { data } = await apiClient.post(`/admin/uploads?folder=${folder}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as { url: string; path: string };
  },
};
