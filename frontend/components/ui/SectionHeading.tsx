"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/format";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
}

export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  action,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex flex-col gap-1",
        align === "center" ? "items-center text-center" : "items-start text-left",
        action && "sm:flex-row sm:items-end sm:justify-between sm:text-left"
      )}
    >
      <div>
        <h2 className="text-2xl font-extrabold text-primary-500 sm:text-3xl">{title}</h2>
        {subtitle && (
          <p className="mt-1.5 max-w-md text-sm text-ink-700">{subtitle}</p>
        )}
      </div>
      {action}
    </motion.div>
  );
}
