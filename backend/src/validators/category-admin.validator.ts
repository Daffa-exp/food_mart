import { z } from "zod";

export const categoryAdminSchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  slug: z.string().min(2).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug tidak valid"),
  icon: z.string().min(1, "Pilih icon"),
  description: z.string().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export type CategoryAdminPayload = z.infer<typeof categoryAdminSchema>;
