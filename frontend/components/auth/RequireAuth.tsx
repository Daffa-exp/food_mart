"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useHasMounted } from "@/hooks/useHasMounted";
import Button from "@/components/ui/Button";

export default function RequireAuth({
  children,
  message = "Masuk untuk melihat halaman ini",
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const hasMounted = useHasMounted();
  const { user, isLoading } = useUser();

  if (!hasMounted || isLoading) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
          <LogIn className="h-6 w-6" />
        </span>
        <div>
          <p className="font-semibold text-ink-900">{message}</p>
          <p className="mt-1 text-sm text-ink-700">Masuk ke akun FoodMart kamu terlebih dahulu</p>
        </div>
        <Link href="/login">
          <Button>Masuk Sekarang</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
