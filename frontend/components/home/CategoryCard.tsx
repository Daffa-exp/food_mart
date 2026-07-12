"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  label: string;
}

export default function CategoryCard({ icon: Icon, label }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      className="flex cursor-pointer flex-col items-center gap-2.5 rounded-card p-3 text-center transition-colors hover:bg-surface-cream"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500 transition-colors">
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </span>
      <span className="text-xs font-medium text-ink-700">{label}</span>
    </motion.div>
  );
}
