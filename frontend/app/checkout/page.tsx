"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import ShippingForm from "@/components/checkout/ShippingForm";
import SavedAddressPicker from "@/components/checkout/SavedAddressPicker";
import DeliveryMethodSelector from "@/components/checkout/DeliveryMethodSelector";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import OrderSummary from "@/components/checkout/OrderSummary";
import RequireAuth from "@/components/auth/RequireAuth";
import { checkoutSchema, CheckoutFormValues } from "@/utils/checkout-validation";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import { useCartStore } from "@/store/cart-store";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { orderService } from "@/services/order.service";

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <PageHeader
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Keranjang", href: "/keranjang" },
          { label: "Checkout" },
        ]}
        title="Checkout Pesanan"
        subtitle="Lengkapi informasi pengiriman dan pilih metode pembayaran"
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <RequireAuth message="Masuk dulu untuk melanjutkan ke checkout">
          <CheckoutForm />
        </RequireAuth>
      </main>

      <Footer />
    </>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const { payWithSnap } = useMidtransSnap();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferredPayment, setPreferredPayment] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { deliveryMethod: "instant", city: "Jakarta Pusat" },
  });

  const { data: pricing, isLoading: isPricingLoading } = usePricingSettings();
  const deliveryMethod = form.watch("deliveryMethod");
  const freeShippingMinPurchase = pricing?.freeShippingMinPurchase ?? 0;
  const freeShipping = subtotal >= freeShippingMinPurchase && !isPricingLoading;
  const shippingFee = freeShipping ? 0 : pricing?.shippingFee[deliveryMethod] ?? 0;
  const serviceFee = pricing?.serviceFee ?? 0;

  async function handleConfirm() {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Lengkapi informasi pengiriman terlebih dahulu");
      return;
    }
    if (lines.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }

    const values = form.getValues();
    setIsSubmitting(true);

    try {
      const result = await orderService.createOrder({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        fullAddress: values.fullAddress,
        addressNote: values.addressNote,
        city: values.city,
        postalCode: values.postalCode,
        deliveryMethod: values.deliveryMethod,
        orderNote,
        couponCode: couponCode || undefined,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });

      // PENTING: cart dikosongkan SEKARANG (begitu order tersimpan di
      // server), BUKAN menunggu callback onSuccess/onPending dari Snap.
      // Snap.js adalah script pihak ketiga yang di-load di browser — kalau
      // koneksi lambat, tab keburu ditutup, atau ada payment method yang
      // redirect penuh keluar halaman sebelum callback sempat jalan, cart
      // bisa gak pernah ke-clear walau order-nya sudah valid di database.
      // Item yang sudah di-checkout dianggap "sudah dipesan" begitu order
      // tercatat — kalau pembayarannya belum selesai/gagal, user tetap bisa
      // melanjutkan lewat tombol "Bayar Sekarang" di halaman Riwayat
      // Pesanan (tidak perlu item itu ada lagi di keranjang).
      clearCart();

      payWithSnap(result.snapToken, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil!");
          router.push(`/checkout/berhasil?order_id=${result.orderId}`);
        },
        onPending: () => {
          toast("Menunggu pembayaran kamu diselesaikan");
          router.push(`/checkout/berhasil?order_id=${result.orderId}`);
        },
        onError: () => {
          toast.error("Pembayaran gagal, silakan coba lagi");
          router.push(`/checkout/gagal?order_id=${result.orderId}`);
        },
        onClose: () => {
          toast("Kamu menutup jendela pembayaran. Order tetap tersimpan, kamu bisa bayar lagi lewat Riwayat Pesanan.", {
            duration: 5000,
          });
          router.push(`/checkout/berhasil?order_id=${result.orderId}`);
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat order";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <SavedAddressPicker form={form} />
        <ShippingForm form={form} />
        <DeliveryMethodSelector
          value={deliveryMethod}
          onChange={(val) => form.setValue("deliveryMethod", val)}
          freeShipping={freeShipping}
          shippingFee={pricing?.shippingFee ?? { instant: 0, same_day: 0, regular: 0 }}
        />
        <PaymentMethodSelector value={preferredPayment} onChange={setPreferredPayment} />
      </div>

      <div>
        <OrderSummary
          lines={lines}
          subtotal={subtotal}
          shippingFee={shippingFee}
          serviceFee={serviceFee}
          couponCode={couponCode}
          onCouponCodeChange={setCouponCode}
          orderNote={orderNote}
          onOrderNoteChange={setOrderNote}
          isSubmitting={isSubmitting}
          onSubmit={handleConfirm}
        />
      </div>
    </div>
  );
}
