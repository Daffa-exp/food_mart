"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminProduct, useAdminProductMutations } from "@/hooks/useAdmin";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, isError } = useAdminProduct(id);
  const { update } = useAdminProductMutations();

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: "Products", href: "/admin/products" },
          { label: "Edit Produk" },
        ]}
      />
      <h1 className="text-xl font-extrabold text-ink-900">Edit Produk</h1>

      <div className="max-w-3xl rounded-card border border-surface-border bg-white p-6">
        {isLoading && <div className="h-96 animate-pulse rounded-card bg-surface-cream" />}
        {isError && <p className="text-sm text-red-500">Gagal memuat data produk.</p>}
        {product && (
          <ProductForm
            initialData={product}
            onSubmit={(payload) =>
              update.mutate({ id, payload }, { onSuccess: () => router.push("/admin/products") })
            }
            isSubmitting={update.isPending}
            submitLabel="Simpan Perubahan"
          />
        )}
      </div>
    </div>
  );
}
