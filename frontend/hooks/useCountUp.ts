"use client";

import { useEffect, useState } from "react";

/**
 * Menganimasikan angka dari 0 ke target value dalam durasi tertentu.
 * Dipakai di StatCard supaya angka dashboard terasa hidup, bukan muncul statis.
 */
export function useCountUp(target: number, durationMs = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      // easeOutQuart — cepat di awal, melambat di akhir (terasa premium)
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
