"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils/format";
import { useCountUp } from "@/hooks/useCountUp";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  format?: (n: number) => string;
  accent?: "primary" | "success" | "amber";
}

const ACCENT_CLASSES = {
  primary: "bg-primary-50 text-primary-500",
  success: "bg-success-50 text-success-500",
  amber: "bg-amber-50 text-amber-600",
};

export default function StatCard({ icon: Icon, label, value, format, accent = "primary" }: StatCardProps) {
  const animatedValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="rounded-card border border-surface-border bg-white p-5 transition-shadow hover:shadow-card-hover"
    >
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", ACCENT_CLASSES[accent])}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-xl font-extrabold text-ink-900">
        {format ? format(animatedValue) : animatedValue.toLocaleString("id-ID")}
      </p>
      <p className="text-xs text-ink-700">{label}</p>
    </motion.div>
  );
}
