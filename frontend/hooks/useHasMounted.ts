"use client";

import { useEffect, useState } from "react";

/**
 * Mengembalikan `true` hanya setelah komponen mounted di client.
 * Dipakai untuk state yang di-hydrate dari localStorage (mis. Zustand persist)
 * agar render pertama di server & client tetap sama, menghindari
 * warning "Hydration failed" dari Next.js.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  return hasMounted;
}
