"use client";

import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminProductMutations } from "@/hooks/useAdmin";

export default function NewProductPage() {
  const router = useRouter();
  const { create } = useAdminProductMutations();

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: "Products", href: "/admin/products" },
          { label: "Tambah Produk" },
        ]}
      />
      <h1 className="text-xl font-extrabold text-ink-900">Tambah Produk Baru</h1>

      <div className="max-w-3xl rounded-card border border-surface-border bg-white p-6">
        <ProductForm
          onSubmit={(payload) =>
            create.mutate(payload, { onSuccess: () => router.push("/admin/products") })
          }
          isSubmitting={create.isPending}
          submitLabel="Simpan Produk"
        />
      </div>
    </div>
  );
}
