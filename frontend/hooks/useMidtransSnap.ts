"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

/**
 * Memuat script Snap.js Midtrans (sandbox by default) dan mengembalikan
 * fungsi `payWithSnap` untuk membuka popup pembayaran.
 */
export function useMidtransSnap() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const snapUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ??
      "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";

    if (window.snap) {
      setIsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function payWithSnap(
    token: string,
    callbacks: {
      onSuccess?: (result: unknown) => void;
      onPending?: (result: unknown) => void;
      onError?: (result: unknown) => void;
      onClose?: () => void;
    }
  ) {
    if (!window.snap) {
      callbacks.onError?.(new Error("Snap.js belum siap, coba lagi sebentar"));
      return;
    }
    window.snap.pay(token, callbacks);
  }

  return { isReady, payWithSnap };
}
