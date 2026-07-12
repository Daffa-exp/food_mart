"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { SavedAddress, AddressPayload } from "@/services/address.service";

const CITIES = [
  "Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara",
  "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan",
];

export default function AddressModal({
  initialData, onClose, onSubmit, isSubmitting,
}: {
  initialData?: SavedAddress;
  onClose: () => void;
  onSubmit: (payload: AddressPayload) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<AddressPayload>({
    recipientName: initialData?.recipientName ?? "",
    phoneNumber: initialData?.phoneNumber ?? "",
    fullAddress: initialData?.fullAddress ?? "",
    addressNote: initialData?.addressNote ?? "",
    city: initialData?.city ?? "",
    postalCode: initialData?.postalCode ?? "",
    isDefault: initialData?.isDefault ?? false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <AnimatedModal onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">
            {initialData ? "Edit Alamat" : "Tambah Alamat Baru"}
          </h3>
          <button onClick={onClose}><X className="h-5 w-5 text-ink-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Penerima *"
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            required
          />
          <Input
            label="Nomor Telepon *"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Alamat Lengkap *</label>
            <textarea
              rows={2}
              value={form.fullAddress}
              onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
              required
              className="w-full resize-none rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <Input
            label="Catatan Alamat"
            placeholder="Patokan, lantai, blok, dll..."
            value={form.addressNote}
            onChange={(e) => setForm({ ...form, addressNote: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Kota *</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                className="w-full rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white"
              >
                <option value="">Pilih kota</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input
              label="Kode Pos *"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 accent-primary-500"
            />
            Jadikan alamat utama
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Alamat"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
