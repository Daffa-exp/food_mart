"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAdminSettings, useAdminSettingsMutation } from "@/hooks/useAdmin";

interface StoreInfo {
  name: string; tagline: string; email: string; phone: string; address: string; operating_hours: string;
}
interface ShippingFee {
  instant: number; same_day: number; regular: number; free_shipping_min: number;
}
interface ServiceFee {
  amount: number;
}

export default function AdminSettingsPage() {
  const { data, isLoading, isError } = useAdminSettings();
  const mutation = useAdminSettingsMutation();

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [shippingFee, setShippingFee] = useState<ShippingFee | null>(null);
  const [serviceFee, setServiceFee] = useState<ServiceFee | null>(null);

  useEffect(() => {
    if (data) {
      setStoreInfo(data.store_info as StoreInfo);
      setShippingFee(data.shipping_fee as ShippingFee);
      setServiceFee(data.service_fee as ServiceFee);
    }
  }, [data]);

  if (isLoading) return <div className="h-96 animate-pulse rounded-card bg-white" />;
  if (isError || !storeInfo || !shippingFee || !serviceFee) {
    return <p className="text-sm text-red-500">Gagal memuat settings.</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-700">Konfigurasi umum toko FoodMart</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-ink-900">Informasi Toko</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nama Toko" value={storeInfo.name} onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })} />
            <Input label="Tagline" value={storeInfo.tagline} onChange={(e) => setStoreInfo({ ...storeInfo, tagline: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Email" value={storeInfo.email} onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })} />
            <Input label="Telepon" value={storeInfo.phone} onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })} />
          </div>
          <Input label="Alamat" value={storeInfo.address} onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} />
          <Input label="Jam Operasional" value={storeInfo.operating_hours} onChange={(e) => setStoreInfo({ ...storeInfo, operating_hours: e.target.value })} />
          <Button onClick={() => mutation.mutate({ key: "store_info", value: storeInfo as unknown as Record<string, unknown> })} disabled={mutation.isPending}>
            Simpan Info Toko
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-ink-900">Ongkos Kirim</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Instant (Rp)" type="number" value={shippingFee.instant} onChange={(e) => setShippingFee({ ...shippingFee, instant: Number(e.target.value) })} />
          <Input label="Same Day (Rp)" type="number" value={shippingFee.same_day} onChange={(e) => setShippingFee({ ...shippingFee, same_day: Number(e.target.value) })} />
          <Input label="Regular (Rp)" type="number" value={shippingFee.regular} onChange={(e) => setShippingFee({ ...shippingFee, regular: Number(e.target.value) })} />
          <Input label="Min. Gratis Ongkir (Rp)" type="number" value={shippingFee.free_shipping_min} onChange={(e) => setShippingFee({ ...shippingFee, free_shipping_min: Number(e.target.value) })} />
        </div>
        <Button className="mt-4" onClick={() => mutation.mutate({ key: "shipping_fee", value: shippingFee as unknown as Record<string, unknown> })} disabled={mutation.isPending}>
          Simpan Ongkos Kirim
        </Button>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-ink-900">Biaya Layanan</h3>
        <Input label="Biaya Layanan (Rp)" type="number" value={serviceFee.amount} onChange={(e) => setServiceFee({ amount: Number(e.target.value) })} />
        <Button className="mt-4" onClick={() => mutation.mutate({ key: "service_fee", value: serviceFee as unknown as Record<string, unknown> })} disabled={mutation.isPending}>
          Simpan Biaya Layanan
        </Button>
      </div>

      <p className="text-xs text-amber-600">
      </p>
    </div>
  );
}
