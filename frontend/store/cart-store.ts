"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/entities";
import { getProductImage } from "@/utils/format";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  categoryLabel: string;
  imageUrl: string;
  price: number;
  quantity: number;
  isFavorite: boolean;
}

interface CartState {
  lines: CartLine[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === product.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === product.id
                  ? { ...l, quantity: l.quantity + quantity }
                  : l
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                categoryLabel: product.categoryLabel,
                imageUrl: getProductImage(product.images),
                price: product.finalPrice,
                quantity,
                isFavorite: false,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),

      incrementItem: (productId) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l
          ),
        })),

      decrementItem: (productId) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.productId === productId ? { ...l, quantity: l.quantity - 1 } : l
            )
            .filter((l) => l.quantity > 0),
        })),

      toggleFavorite: (productId) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.productId === productId ? { ...l, isFavorite: !l.isFavorite } : l
          ),
        })),

      clearCart: () => set({ lines: [] }),

      totalItems: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: "foodmart-cart" }
  )
);
