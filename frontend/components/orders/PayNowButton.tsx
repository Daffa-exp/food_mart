"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreditCard } from "lucide-react";
import Button from "@/components/ui/Button";
import { orderService } from "@/services/order.service";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

export default function PayNowButton({
  orderId,
  className,
  size = "md",
  variant = "primary",
  label = "Bayar Sekarang",
}: {
  orderId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost" | "white";
  label?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { payWithSnap } = useMidtransSnap();
  const [isLoading, setIsLoading] = useState(false);

  async function handlePayNow() {
    setIsLoading(true);
    try {
      const { snapToken } = await orderService.resumePayment(orderId);
      payWithSnap(snapToken, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["order-status-live"] });
          queryClient.invalidateQueries({ queryKey: ["my-orders"] });
          toast.success("Pembayaran berhasil!");
          router.push(`/checkout/berhasil?order_id=${orderId}`);
        },
        onPending: () => {
          queryClient.invalidateQueries({ queryKey: ["order-status-live"] });
          queryClient.invalidateQueries({ queryKey: ["my-orders"] });
          toast("Menunggu pembayaran kamu diselesaikan");
          router.push(`/checkout/berhasil?order_id=${orderId}`);
        },
        onError: () => {
          queryClient.invalidateQueries({ queryKey: ["order-status-live"] });
          queryClient.invalidateQueries({ queryKey: ["my-orders"] });
          toast.error("Pembayaran gagal, silakan coba lagi");
          router.push(`/checkout/berhasil?order_id=${orderId}`);
        },
        onClose: () => {
          queryClient.invalidateQueries({ queryKey: ["my-orders"] });
          toast("Kamu menutup jendela pembayaran");
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memuat halaman pembayaran";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handlePayNow} disabled={isLoading}>
      <CreditCard className="h-4 w-4" />
      {isLoading ? "Memuat..." : label}
    </Button>
  );
}
