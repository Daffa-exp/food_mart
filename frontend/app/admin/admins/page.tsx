"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import CreateAdminModal from "@/components/admin/CreateAdminModal";
import { cn } from "@/utils/format";
import { useAdminAccounts, useAdminAccountMutations, useAdminProfile } from "@/hooks/useAdmin";

export default function AdminManagementPage() {
  const { data: me } = useAdminProfile();
  const { data: admins, isLoading, isError } = useAdminAccounts();
  const { create, update, remove } = useAdminAccountMutations();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (me && me.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <ShieldAlert className="h-10 w-10 text-amber-500" />
        <p className="font-medium text-ink-900">Halaman ini khusus Super Admin</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Admin Management</h1>
          <p className="text-sm text-ink-700">Kelola akun admin lain (khusus Super Admin)</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4" /> Tambah Admin</Button>
      </div>

      <div className="rounded-card border border-surface-border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-700">Memuat...</td></tr>}
            {isError && <tr><td colSpan={5} className="px-4 py-8 text-center text-red-500">Gagal memuat admin.</td></tr>}
            {admins?.map((a) => (
              <tr key={a.id} className="border-b border-surface-border hover:bg-surface-cream/40">
                <td className="px-4 py-3 font-medium text-ink-900">{a.fullName}</td>
                <td className="px-4 py-3 text-ink-700">{a.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={a.role}
                    onChange={(e) => update.mutate({ id: a.id, payload: { role: e.target.value } })}
                    className="rounded-input border border-surface-border px-2 py-1 text-xs outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => update.mutate({ id: a.id, payload: { isActive: !a.isActive } })}
                    className={cn("rounded-pill px-2.5 py-1 text-xs font-semibold", a.isActive ? "bg-success-50 text-success-500" : "bg-red-50 text-red-500")}
                  >
                    {a.isActive ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => confirm(`Hapus admin ${a.fullName}?`) && remove.mutate(a.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-input text-red-500 hover:bg-red-50 ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {admins?.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-700">Belum ada admin lain.</td></tr>}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setShowCreateModal(false) })}
          isSubmitting={create.isPending}
        />
      )}
    </div>
  );
}
