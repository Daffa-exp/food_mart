"use client";

import { UseFormReturn } from "react-hook-form";
import { MapPin } from "lucide-react";
import Input from "@/components/ui/Input";
import { CheckoutFormValues } from "@/utils/checkout-validation";

const CITIES = [
  "Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara",
  "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan",
];

export default function ShippingForm({ form }: { form: UseFormReturn<CheckoutFormValues> }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary-500" />
        <h2 className="text-sm font-bold text-ink-900">Informasi Pengiriman</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nama Lengkap *"
            placeholder="Masukkan nama lengkap"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Nomor Telepon *"
            placeholder="8xx-xxxx-xxxx"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />
        </div>

        <Input
          label="Email *"
          type="email"
          placeholder="nama@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            Alamat Pengiriman *
          </label>
          <div className="relative">
            <textarea
              rows={2}
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
              className="w-full resize-none rounded-input border border-surface-border bg-surface-cream/60 py-3 pl-4 pr-11 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              {...register("fullAddress")}
            />
            <MapPin className="absolute right-3.5 top-3.5 h-4 w-4 text-primary-500" />
          </div>
          {errors.fullAddress && (
            <p className="mt-1 text-xs text-red-500">{errors.fullAddress.message}</p>
          )}
        </div>

        <Input
          label="Catatan Alamat"
          placeholder="Patokan, lantai, blok, dll..."
          {...register("addressNote")}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Kota *</label>
            <select
              className="w-full rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              {...register("city")}
            >
              <option value="">Pilih kota</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
          </div>
          <Input
            label="Kode Pos *"
            placeholder="40123"
            error={errors.postalCode?.message}
            {...register("postalCode")}
          />
        </div>
      </div>
    </div>
  );
}
