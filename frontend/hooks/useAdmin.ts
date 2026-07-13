"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import {
  adminAuthService, adminDashboardService, adminProductService, adminCategoryService,
  adminOrderService, AdminProductListParams, AdminOrderListParams,
  adminCouponService, adminPromotionService, adminBannerService, adminReviewService,
  adminCustomerService, adminPaymentService, adminSettingsService, adminInventoryService,
  adminManagementService, adminChatService,
} from "@/services/admin.service";

export function useAdminProfile() {
  const { user, isLoading: isUserLoading } = useUser();
  const query = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => adminAuthService.getMe(),
    enabled: !!user,
    retry: false,
  });

  return { ...query, isLoading: isUserLoading || (!!user && query.isLoading) };
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: () => adminDashboardService.getSummary(),
    refetchInterval: 15000,
  });
}

export function useAdminProducts(params: AdminProductListParams) {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => adminProductService.list(params),
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => adminProductService.getById(id),
    enabled: !!id,
  });
}

export function useAdminProductMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-products"] });

  const create = useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminProductService.create(payload),
    onSuccess: () => { invalidate(); toast.success("Produk berhasil dibuat"); },
    onError: (e: Error) => toast.error(e.message || "Gagal membuat produk"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      adminProductService.update(id, payload),
    onSuccess: () => { invalidate(); toast.success("Produk berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui produk"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminProductService.remove(id),
    onSuccess: () => { invalidate(); toast.success("Produk berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus produk"),
  });

  const setActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminProductService.setActive(id, isActive),
    onSuccess: () => { invalidate(); toast.success("Status produk diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal mengubah status"),
  });

  const updateStock = useMutation({
    mutationFn: ({ id, quantity, note }: { id: string; quantity: number; note?: string }) =>
      adminProductService.updateStock(id, quantity, note),
    onSuccess: () => {
      invalidate();
      // Halaman Inventory pakai query key terpisah ("admin-inventory"), jadi
      // perlu di-invalidate juga di sini, atau tabelnya tidak ikut refresh
      // otomatis dan kelihatan harus reload manual.
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      toast.success("Stok berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui stok"),
  });

  return { create, update, remove, setActive, updateStock };
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminCategoryService.list(),
  });
}

export function useAdminCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] }); // dipakai juga di sisi customer
  };

  const create = useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminCategoryService.create(payload),
    onSuccess: () => { invalidate(); toast.success("Kategori berhasil dibuat"); },
    onError: (e: Error) => toast.error(e.message || "Gagal membuat kategori"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      adminCategoryService.update(id, payload),
    onSuccess: () => { invalidate(); toast.success("Kategori berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui kategori"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminCategoryService.remove(id),
    onSuccess: () => { invalidate(); toast.success("Kategori berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus kategori"),
  });

  return { create, update, remove };
}

export function useAdminOrders(params: AdminOrderListParams) {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => adminOrderService.list(params),
    // Poll berkala supaya perubahan status dari webhook Midtrans (pembayaran
    // settlement/gagal) langsung kelihatan di sini tanpa admin harus manual
    // refresh halaman. refetchIntervalInBackground default false, jadi
    // otomatis berhenti polling kalau tab tidak aktif — hemat resource.
    refetchInterval: 15000,
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => adminOrderService.getById(id),
    enabled: !!id,
    refetchInterval: 15000,
  });
}

export function useAdminOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminOrderService.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order", variables.id] });
      toast.success("Status order berhasil diubah");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal mengubah status order"),
  });
}

// =========================================================
// Generic list + CRUD mutation hook factory
// =========================================================
function createCrudHooks<T>(
  queryKey: string,
  service: {
    list: () => Promise<T[]>;
    create: (p: Record<string, unknown>) => Promise<T>;
    update: (id: string, p: Record<string, unknown>) => Promise<T>;
    remove: (id: string) => Promise<void>;
  }
) {
  function useList() {
    return useQuery({ queryKey: [queryKey], queryFn: service.list });
  }
  function useMutations() {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

    const create = useMutation({
      mutationFn: (payload: Record<string, unknown>) => service.create(payload),
      onSuccess: () => { invalidate(); toast.success("Berhasil dibuat"); },
      onError: (e: Error) => toast.error(e.message || "Gagal membuat data"),
    });
    const update = useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => service.update(id, payload),
      onSuccess: () => { invalidate(); toast.success("Berhasil diperbarui"); },
      onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
    });
    const remove = useMutation({
      mutationFn: (id: string) => service.remove(id),
      onSuccess: () => { invalidate(); toast.success("Berhasil dihapus"); },
      onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
    });
    return { create, update, remove };
  }
  return { useList, useMutations };
}

export const { useList: useAdminCoupons, useMutations: useAdminCouponMutations } =
  createCrudHooks("admin-coupons", adminCouponService);

export const { useList: useAdminPromotions, useMutations: useAdminPromotionMutations } =
  createCrudHooks("admin-promotions", adminPromotionService);

export const { useList: useAdminBanners, useMutations: useAdminBannerMutations } =
  createCrudHooks("admin-banners", adminBannerService);

export function useAdminReviews() {
  return useQuery({ queryKey: ["admin-reviews"], queryFn: () => adminReviewService.list() });
}

export function useAdminReviewMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });

  const reply = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) => adminReviewService.reply(id, reply),
    onSuccess: () => { invalidate(); toast.success("Balasan terkirim"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const setVisibility = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) => adminReviewService.setVisibility(id, isVisible),
    onSuccess: () => { invalidate(); toast.success("Visibilitas diperbarui"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { reply, setVisibility };
}

export function useAdminCustomers(params: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({ queryKey: ["admin-customers", params], queryFn: () => adminCustomerService.list(params) });
}

export function useAdminCustomerMutations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminCustomerService.setActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success("Status customer diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminPayments(params: { status?: string; page?: number; pageSize?: number }) {
  return useQuery({ queryKey: ["admin-payments", params], queryFn: () => adminPaymentService.list(params) });
}

export function useAdminSettings() {
  return useQuery({ queryKey: ["admin-settings"], queryFn: () => adminSettingsService.get() });
}

export function useAdminSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: Record<string, unknown> }) => adminSettingsService.update(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Setting berhasil disimpan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminInventory(lowStockOnly = false) {
  return useQuery({ queryKey: ["admin-inventory", lowStockOnly], queryFn: () => adminInventoryService.list(lowStockOnly) });
}

export function useAdminInventoryMutations() {
  return useAdminProductMutations(); // updateStock sudah ada di sana
}

export function useAdminAccounts() {
  return useQuery({ queryKey: ["admin-accounts"], queryFn: () => adminManagementService.list() });
}

export function useAdminAccountMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });

  const create = useMutation({
    mutationFn: (payload: { fullName: string; email: string; password: string; role: string }) =>
      adminManagementService.create(payload),
    onSuccess: () => { invalidate(); toast.success("Admin baru berhasil dibuat"); },
    onError: (e: Error) => toast.error(e.message || "Gagal membuat admin"),
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      adminManagementService.update(id, payload),
    onSuccess: () => { invalidate(); toast.success("Admin berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminManagementService.remove(id),
    onSuccess: () => { invalidate(); toast.success("Admin berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return { create, update, remove };
}

export function useAdminChatConversations() {
  return useQuery({
    queryKey: ["admin-chat-conversations"],
    queryFn: () => adminChatService.listConversations(),
    refetchInterval: 5000,
  });
}

export function useAdminChatMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-chat-messages", conversationId],
    queryFn: () => adminChatService.listMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 4000,
  });

  const reply = useMutation({
    mutationFn: (message: string) => adminChatService.sendMessage(conversationId!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-conversations"] });
    },
    onError: (e: Error) => toast.error(e.message || "Gagal mengirim balasan"),
  });

  return { ...query, reply };
}
