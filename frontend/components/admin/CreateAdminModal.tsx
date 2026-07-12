"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AnimatedModal from "@/components/ui/AnimatedModal";

export default function CreateAdminModal({
  onClose, onSubmit, isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (payload: { fullName: string; email: string; password: string; role: string }) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "admin" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <AnimatedModal onClose={onClose}>
      <div className="w-full max-w-md rounded-card bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">Tambah Admin Baru</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-ink-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Lengkap" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password Awal" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Membuat..." : "Buat Admin"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
