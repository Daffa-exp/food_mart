"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import { cn } from "@/utils/format";
import { useAdminCustomers, useAdminCustomerMutations } from "@/hooks/useAdmin";

const PAGE_SIZE = 15;

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminCustomers({ search: search || undefined, page, pageSize: PAGE_SIZE });
  const setActive = useAdminCustomerMutations();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Customers</h1>
        <p className="text-sm text-ink-700">Kelola akun pelanggan FoodMart</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white">
        <div className="border-b border-surface-border p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama / email..."
              className="w-full rounded-pill border border-surface-border bg-surface-cream/60 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telepon</th>
              <th className="px-4 py-3">Bergabung</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-700">Memuat...</td></tr>}
            {isError && <tr><td colSpan={5} className="px-4 py-8 text-center text-red-500">Gagal memuat customer.</td></tr>}
            {data?.data.map((c) => (
              <tr key={c.id} className="border-b border-surface-border hover:bg-surface-cream/40">
                <td className="px-4 py-3 font-medium text-ink-900">{c.fullName}</td>
                <td className="px-4 py-3 text-ink-700">{c.email}</td>
                <td className="px-4 py-3 text-ink-700">{c.phoneNumber ?? "-"}</td>
                <td className="px-4 py-3 text-ink-400">{new Date(c.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setActive.mutate({ id: c.id, isActive: !c.isActive })}
                    className={cn(
                      "rounded-pill px-2.5 py-1 text-xs font-semibold",
                      c.isActive ? "bg-success-50 text-success-500" : "bg-red-50 text-red-500"
                    )}
                  >
                    {c.isActive ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
              </tr>
            ))}
            {data?.data.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-700">Belum ada customer.</td></tr>}
          </tbody>
        </table>
        </div>

        {data && <AdminPagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </div>
    </div>
  );
}
