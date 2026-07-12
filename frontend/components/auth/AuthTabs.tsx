"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/utils/format";

export default function AuthTabs({ active }: { active: "masuk" | "daftar" }) {
  return (
    <div className="relative grid grid-cols-2 rounded-pill bg-surface-cream p-1">
      <TabLink href="/login" label="Masuk" isActive={active === "masuk"} />
      <TabLink href="/register" label="Daftar" isActive={active === "daftar"} />
    </div>
  );
}

function TabLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link href={href} className="relative z-10 py-2.5 text-center">
      {isActive && (
        <motion.span
          layoutId="auth-tab-active"
          className="absolute inset-0 -z-10 rounded-pill bg-primary-500"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span
        className={cn(
          "text-sm font-semibold transition-colors",
          isActive ? "text-white" : "text-ink-700"
        )}
      >
        {label}
      </span>
    </Link>
  );
}
