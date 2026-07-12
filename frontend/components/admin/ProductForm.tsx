"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import ImageUploader from "@/components/ui/ImageUploader";
import Button from "@/components/ui/Button";
import { useAdminCategories } from "@/hooks/useAdmin";
import { productFormSchema, ProductFormValues, slugify } from "@/utils/product-form-validation";
import { AdminProduct } from "@/types/admin";

interface ProductFormProps {
  initialData?: AdminProduct & { categoryId?: string; description?: string; composition?: string[] };
  onSubmit: (payload: Record<string, unknown>) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export default function ProductForm({ initialData, onSubmit, isSubmitting, submitLabel }: ProductFormProps) {
  const router = useRouter();
  const { data: categories } = useAdminCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      categoryId: initialData?.categoryId ?? "",
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      description: initialData?.description ?? "",
      compositionText: initialData?.composition?.join("\n") ?? "",
      price: initialData?.price ?? 0,
      discountPercentage: initialData?.discountPercentage ?? 0,
      isBestSeller: initialData?.isBestSeller ?? false,
      isPromo: initialData?.isPromo ?? false,
      isNew: initialData?.isNew ?? false,
      imagesText: initialData?.images?.join("\n") ?? "",
    },
  });

  const nameValue = watch("name");
  useEffect(() => {
    if (!initialData && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, initialData, setValue]);

  function handleFormSubmit(values: ProductFormValues) {
    onSubmit({
      categoryId: values.categoryId,
      name: values.name,
      slug: values.slug,
      shortDescription: values.shortDescription || undefined,
      description: values.description || undefined,
      composition: values.compositionText
        ? values.compositionText.split("\n").map((s) => s.trim()).filter(Boolean)
        : undefined,
      storageInfo: values.storageInfo || undefined,
      price: values.price,
      discountPercentage: values.discountPercentage,
      calories: values.calories,
      spicyLevel: values.spicyLevel,
      portionInfo: values.portionInfo || undefined,
      weightInfo: values.weightInfo || undefined,
      shelfLifeInfo: values.shelfLifeInfo || undefined,
      expiryInfo: values.expiryInfo || undefined,
      isBestSeller: values.isBestSeller,
      isPromo: values.isPromo,
      isNew: values.isNew,
      images: values.imagesText
        ? values.imagesText.split("\n").map((s) => s.trim()).filter(Boolean)
        : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">Kategori *</label>
          <select
            className="w-full rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            {...register("categoryId")}
          >
            <option value="">Pilih kategori</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
        </div>
        <Input label="Nama Produk *" error={errors.name?.message} {...register("name")} />
      </div>

      <Input label="Slug *" error={errors.slug?.message} {...register("slug")} />
      <Input label="Deskripsi Singkat" error={errors.shortDescription?.message} {...register("shortDescription")} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-900">Deskripsi Lengkap</label>
        <textarea
          rows={4}
          className="w-full resize-none rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">Komposisi (satu per baris)</label>
          <textarea
            rows={4}
            placeholder={"Roti Brioche\nDouble Beef Patty\nKeju Cheddar"}
            className="w-full resize-none rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            {...register("compositionText")}
          />
        </div>
        <div>
          <ImageUploader
            label="Gambar Utama"
            value={watch("imagesText")?.split("\n")[0]?.trim() || ""}
            onChange={(url) => {
              const rest = (watch("imagesText") || "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(1);
              setValue("imagesText", url ? [url, ...rest].join("\n") : rest.join("\n"));
            }}
            folder="products"
          />
          <label className="mb-1.5 mt-3 block text-sm font-medium text-ink-900">Gambar Tambahan (opsional, URL satu per baris)</label>
          <textarea
            rows={3}
            placeholder={"https://...\nhttps://..."}
            className="w-full resize-none rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            {...register("imagesText")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Input label="Harga (Rp) *" type="number" error={errors.price?.message} {...register("price")} />
        <Input label="Diskon (%)" type="number" {...register("discountPercentage")} />
        <Input label="Kalori" type="number" {...register("calories")} />
        <Input label="Level Pedas (0-5)" type="number" min={0} max={5} {...register("spicyLevel")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Info Porsi" placeholder="1 Orang" {...register("portionInfo")} />
        <Input label="Berat" placeholder="±350 gram" {...register("weightInfo")} />
        <Input label="Masa Simpan" placeholder="24 Jam" {...register("shelfLifeInfo")} />
        <Input label="Info Kedaluwarsa" placeholder="1 Hari Setelah Produksi" {...register("expiryInfo")} />
      </div>

      <div className="flex flex-wrap gap-6">
        <Controller
          control={control}
          name="isBestSeller"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 accent-primary-500" />
              Best Seller
            </label>
          )}
        />
        <Controller
          control={control}
          name="isPromo"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 accent-primary-500" />
              Promo
            </label>
          )}
        />
        <Controller
          control={control}
          name="isNew"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 accent-primary-500" />
              Produk Baru
            </label>
          )}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
