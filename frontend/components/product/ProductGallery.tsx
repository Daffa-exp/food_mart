"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Heart, ZoomIn } from "lucide-react";
import { cn, getProductImage } from "@/utils/format";
import { useWishlist } from "@/hooks/useAccountData";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ProductGalleryProps {
  productId: string;
  images: string[];
  name: string;
  isBestSeller: boolean;
  isPromo: boolean;
  discountPercentage: number;
}

export default function ProductGallery({
  productId,
  images,
  name,
  isBestSeller,
  isPromo,
  discountPercentage,
}: ProductGalleryProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useUser();
  const { isWishlisted, add, remove } = useWishlist();
  const wishlisted = isWishlisted(productId);

  function handleWishlist() {
    if (!user) {
      toast.error("Silakan login dulu untuk memakai wishlist");
      router.push("/login");
      return;
    }
    if (wishlisted) {
      remove(productId);
    } else {
      add(productId);
    }
  }

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: name, url: window.location.href }).catch(() => {});
    } else {
      toast.success("Link produk disalin");
    }
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-surface-border bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative h-full w-full"
          >
            <Image src={getProductImage([images[activeIndex]])} alt={name} fill className="object-cover" priority />
          </motion.div>
        </AnimatePresence>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isBestSeller && (
            <span className="rounded-pill bg-primary-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              Best Seller
            </span>
          )}
          {isPromo && (
            <span className="rounded-pill bg-white px-3 py-1 text-xs font-semibold text-primary-500 shadow-sm">
              Promo Hari Ini
            </span>
          )}
        </div>
        {discountPercentage > 0 && (
          <span className="absolute right-3 top-3 rounded-pill bg-success-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
            -{discountPercentage}%
          </span>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-pill bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink-700 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" /> Produk Fresh
        </div>
        <button
          aria-label="Perbesar gambar"
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-700 backdrop-blur transition-colors hover:bg-white"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 transition-colors",
                activeIndex === i ? "border-primary-500" : "border-transparent"
              )}
            >
              <Image src={getProductImage([img])} alt={`${name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2.5">
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-pill border border-surface-border bg-white py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-cream"
        >
          <Share2 className="h-4 w-4" /> Bagikan Produk
        </button>
        <button
          onClick={handleWishlist}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-pill border py-2.5 text-sm font-medium transition-colors",
            wishlisted
              ? "border-primary-500 bg-primary-50 text-primary-500"
              : "border-surface-border bg-white text-ink-700 hover:bg-surface-cream"
          )}
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-primary-500")} />
          Wishlist
        </button>
      </div>
    </div>
  );
}
