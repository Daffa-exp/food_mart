"use client";

import { use } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import PurchaseInfoBox from "@/components/product/PurchaseInfoBox";
import OfficialStoreBar from "@/components/product/OfficialStoreBar";
import ProductDescriptionPanel from "@/components/product/ProductDescriptionPanel";
import ProductSpecsBox from "@/components/product/ProductSpecsBox";
import ProductReviewsBox from "@/components/product/ProductReviewsBox";
import FrequentlyBoughtBox from "@/components/product/FrequentlyBoughtBox";
import PopularityBox from "@/components/product/PopularityBox";
import { useProduct } from "@/hooks/useProducts";


export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: product, isLoading, isError } = useProduct(slug);

  return (
    <>
      <Navbar />

      <div className="border-b border-surface-border bg-surface-cream">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Beranda", href: "/" },
              { label: "Menu", href: "/menu" },
              ...(product
                ? [
                    { label: product.categoryLabel, href: `/menu?kategori=${product.categorySlug}` },
                    { label: product.name },
                  ]
                : []),
            ]}
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-card bg-surface-cream" />
            <div className="h-96 animate-pulse rounded-card bg-surface-cream" />
          </div>
        )}

        {isError && (
          <div className="py-20 text-center">
            <p className="font-medium text-ink-900">Produk tidak ditemukan</p>
            <p className="mt-1 text-sm text-ink-700">
              Pastikan backend berjalan dan slug produk benar.
            </p>
          </div>
        )}

        {product && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              <ProductGallery
                productId={product.id}
                images={product.images}
                name={product.name}
                isBestSeller={product.isBestSeller}
                isPromo={product.isPromo}
                discountPercentage={product.discountPercentage}
              />
              <PurchaseInfoBox />
              <OfficialStoreBar />
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-4">
              <ProductPurchasePanel product={product} />
              <ProductDescriptionPanel product={product} />
              <PopularityBox product={product} />
              <ProductSpecsBox product={product} />
              <FrequentlyBoughtBox products={product.relatedProducts} />
            </div>
          </div>
        )}

        {product && (
          <div className="mt-6">
            <ProductReviewsBox product={product} />
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
