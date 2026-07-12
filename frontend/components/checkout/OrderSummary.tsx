"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import { CartLine } from "@/store/cart-store";
import Button from "@/components/ui/Button";

interface OrderSummaryProps {
  lines: CartLine[];
  subtotal: number;
  shippingFee: number;
  serviceFee: number;
  couponCode: string;
  onCouponCodeChange: (value: string) => void;
  orderNote: string;
  onOrderNoteChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function OrderSummary({
  lines,
  subtotal,
  shippingFee,
  serviceFee,
  couponCode,
  onCouponCodeChange,
  orderNote,
  onOrderNoteChange,
  isSubmitting,
  onSubmit,
}: OrderSummaryProps) {
  const estimatedTotal = subtotal + shippingFee + serviceFee;

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-900">
          Ringkasan Pesanan
        </h3>
        <ul className="space-y-1.5 text-sm text-ink-700">
          {lines.map((line) => (
            <li key={line.productId} className="flex justify-between">
              <span>{line.name} x{line.quantity}</span>
              <span>{formatRupiah(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1.5 border-t border-surface-border pt-4 text-sm">
          <div className="flex justify-between text-ink-700">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-700">
            <span>Ongkir</span>
            <span>{shippingFee === 0 ? "Gratis" : formatRupiah(shippingFee)}</span>
          </div>
          <div className="flex justify-between text-ink-700">
            <span>Biaya Layanan</span>
            <span>{formatRupiah(serviceFee)}</span>
          </div>
        </div>

        <div className="mt-3">
          <input
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
            placeholder="Kode Promo (opsional)"
            className="w-full rounded-input border border-surface-border bg-surface-cream/60 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div className="mt-3 flex justify-between border-t border-surface-border pt-3 text-base font-bold text-ink-900">
          <span>Total Estimasi</span>
          <span className="text-primary-500">{formatRupiah(estimatedTotal)}</span>
        </div>
        <p className="mt-1 text-[11px] text-ink-400">
          Diskon kupon (jika kode valid) akan dihitung ulang & ditampilkan di
          halaman pembayaran Midtrans.
        </p>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-2 text-sm font-bold text-ink-900">Catatan</h3>
        <textarea
          rows={3}
          value={orderNote}
          onChange={(e) => onOrderNoteChange(e.target.value)}
          placeholder={"Contoh:\n- Jangan pedas\n- Saus dipisah\n- Tambah tisu"}
          className="w-full resize-none rounded-input border border-surface-border bg-surface-cream/60 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <Button
        onClick={onSubmit}
        disabled={isSubmitting || lines.length === 0}
        fullWidth
        size="lg"
      >
        {isSubmitting ? "Memproses..." : `Konfirmasi: ${formatRupiah(estimatedTotal)}`}
      </Button>

      <Link href="/chat?type=checkout">
        <Button variant="outline" fullWidth size="md">
          <MessageSquareText className="h-4 w-4" />
          Chat Penjual
        </Button>
      </Link>
    </div>
  );
}
