"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreditCard } from "lucide-react";
import Button from "@/components/ui/Button";
import { orderService } from "@/services/order.service";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

export default function PayNowButton({
  orderId,
  className,
  size = "md",
}: {
  orderId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const router = useRouter();
  const { payWithSnap } = useMidtransSnap();
  const [isLoading, setIsLoading] = useState(false);

  async function handlePayNow() {
    setIsLoading(true);
    try {
      const { snapToken } = await orderService.resumePayment(orderId);
      payWithSnap(snapToken, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil!");
          router.push(`/checkout/berhasil?order_id=${orderId}`);
        },
        onPending: () => {
          toast("Menunggu pembayaran kamu diselesaikan");
          router.push(`/checkout/berhasil?order_id=${orderId}`);
        },
        onError: () => {
          toast.error("Pembayaran gagal, silakan coba lagi");
        },
        onClose: () => {
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
    <Button size={size} className={className} onClick={handlePayNow} disabled={isLoading}>
      <CreditCard className="h-4 w-4" />
      {isLoading ? "Memuat..." : "Bayar Sekarang"}
    </Button>
  );
}
