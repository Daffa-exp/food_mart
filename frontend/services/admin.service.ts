import { apiClient } from "@/services/api-client";
import {
  AdminProfile, DashboardSummary, AdminProduct, AdminCategory, AdminOrderListItem,
} from "@/types/admin";
import { Order } from "@/types/entities";

export const adminAuthService = {
  async getMe(): Promise<AdminProfile> {
    const { data } = await apiClient.get("/admin/me");
    return data.data;
  },
};

export const adminDashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await apiClient.get("/admin/dashboard/summary");
    return data.data;
  },
};

export interface AdminProductListParams {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export const adminProductService = {
  async list(params: AdminProductListParams = {}): Promise<{ data: AdminProduct[]; total: number }> {
    const { data } = await apiClient.get("/admin/products", { params });
    return { data: data.data, total: data.pagination.total };
  },
  async getById(id: string) {
    const { data } = await apiClient.get(`/admin/products/${id}`);
    return data.data;
  },
  async create(payload: Record<string, unknown>) {
    const { data } = await apiClient.post("/admin/products", payload);
    return data.data;
  },
  async update(id: string, payload: Record<string, unknown>) {
    const { data } = await apiClient.patch(`/admin/products/${id}`, payload);
    return data.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/admin/products/${id}`);
  },
  async setActive(id: string, isActive: boolean) {
    await apiClient.patch(`/admin/products/${id}/active`, { isActive });
  },
  async updateStock(id: string, quantity: number, note?: string) {
    await apiClient.patch(`/admin/products/${id}/stock`, { quantity, note });
  },
};

export const adminCategoryService = {
  async list(): Promise<AdminCategory[]> {
    const { data } = await apiClient.get("/admin/categories");
    return data.data;
  },
  async create(payload: Record<string, unknown>) {
    const { data } = await apiClient.post("/admin/categories", payload);
    return data.data;
  },
  async update(id: string, payload: Record<string, unknown>) {
    const { data } = await apiClient.patch(`/admin/categories/${id}`, payload);
    return data.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/admin/categories/${id}`);
  },
};

export interface AdminOrderListParams {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export const adminOrderService = {
  async list(params: AdminOrderListParams = {}): Promise<{ data: AdminOrderListItem[]; total: number }> {
    const { data } = await apiClient.get("/admin/orders", { params });
    return { data: data.data, total: data.pagination.total };
  },
  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get(`/admin/orders/${id}`);
    return data.data;
  },
  async updateStatus(id: string, status: string) {
    await apiClient.patch(`/admin/orders/${id}/status`, { status });
  },
};

// =========================================================
// Generic CRUD helper — dipakai Coupons, Promotions, Banners
// (pola create/update/delete-nya identik)
// =========================================================
function createCrudService<T>(resourcePath: string) {
  return {
    async list(): Promise<T[]> {
      const { data } = await apiClient.get(`/admin/${resourcePath}`);
      return data.data;
    },
    async create(payload: Record<string, unknown>): Promise<T> {
      const { data } = await apiClient.post(`/admin/${resourcePath}`, payload);
      return data.data;
    },
    async update(id: string, payload: Record<string, unknown>): Promise<T> {
      const { data } = await apiClient.patch(`/admin/${resourcePath}/${id}`, payload);
      return data.data;
    },
    async remove(id: string) {
      await apiClient.delete(`/admin/${resourcePath}/${id}`);
    },
  };
}

export interface AdminCoupon {
  id: string; code: string; description: string | null;
  type: "percentage" | "fixed_amount" | "free_shipping"; value: number;
  minPurchase: number; maxDiscount: number | null; usageLimit: number | null;
  usedCount: number; validFrom: string; validUntil: string; isActive: boolean;
}
export const adminCouponService = createCrudService<AdminCoupon>("coupons");

export interface AdminPromotion {
  id: string; title: string; description: string | null; bannerImageUrl: string | null;
  productId: string | null; discountPercentage: number | null;
  startDate: string; endDate: string; isActive: boolean;
}
export const adminPromotionService = createCrudService<AdminPromotion>("promotions");

export interface AdminBanner {
  id: string; title: string | null; imageUrl: string | null; videoUrl: string | null; linkUrl: string | null;
  displayOrder: number; isActive: boolean; startDate: string | null; endDate: string | null;
}
export const adminBannerService = createCrudService<AdminBanner>("banners");

export interface AdminReview {
  id: string; userName: string; productName: string; rating: number;
  comment: string | null; imageUrls: string[]; adminReply: string | null; isVisible: boolean; createdAt: string;
}
export const adminReviewService = {
  async list(): Promise<AdminReview[]> {
    const { data } = await apiClient.get("/admin/reviews");
    return data.data;
  },
  async reply(id: string, reply: string) {
    await apiClient.patch(`/admin/reviews/${id}/reply`, { reply });
  },
  async setVisibility(id: string, isVisible: boolean) {
    await apiClient.patch(`/admin/reviews/${id}/visibility`, { isVisible });
  },
};

export interface AdminCustomer {
  id: string; fullName: string; email: string; phoneNumber: string | null;
  isEmailVerified: boolean; isActive: boolean; createdAt: string;
}
export const adminCustomerService = {
  async list(params: { search?: string; page?: number; pageSize?: number } = {}): Promise<{ data: AdminCustomer[]; total: number }> {
    const { data } = await apiClient.get("/admin/customers", { params });
    return { data: data.data, total: data.pagination.total };
  },
  async setActive(id: string, isActive: boolean) {
    await apiClient.patch(`/admin/customers/${id}/active`, { isActive });
  },
};

export interface AdminPaymentHistoryItem {
  id: string; orderNumber: string; recipientName: string; paymentMethod: string | null;
  status: string; grossAmount: number; paidAt: string | null; createdAt: string;
}
export const adminPaymentService = {
  async list(params: { status?: string; page?: number; pageSize?: number } = {}): Promise<{ data: AdminPaymentHistoryItem[]; total: number }> {
    const { data } = await apiClient.get("/admin/payments", { params });
    return { data: data.data, total: data.pagination.total };
  },
};

export const adminSettingsService = {
  async get(): Promise<Record<string, unknown>> {
    const { data } = await apiClient.get("/admin/settings");
    return data.data;
  },
  async update(key: string, value: Record<string, unknown>) {
    await apiClient.patch(`/admin/settings/${key}`, { value });
  },
};

export interface AdminInventoryItem {
  productId: string; name: string; slug: string; isActive: boolean;
  stockQuantity: number; lowStockThreshold: number; isLowStock: boolean;
}
export const adminInventoryService = {
  async list(lowStockOnly = false): Promise<AdminInventoryItem[]> {
    const { data } = await apiClient.get("/admin/inventory", { params: { lowStockOnly } });
    return data.data;
  },
  async getLogs(productId: string) {
    const { data } = await apiClient.get(`/admin/inventory/logs/${productId}`);
    return data.data;
  },
};

export interface AdminAccount {
  id: string; fullName: string; email: string; role: "admin" | "super_admin";
  isActive: boolean; lastLoginAt: string | null; createdAt: string;
}
export const adminManagementService = {
  async list(): Promise<AdminAccount[]> {
    const { data } = await apiClient.get("/admin/admins");
    return data.data;
  },
  async create(payload: { fullName: string; email: string; password: string; role: string }) {
    const { data } = await apiClient.post("/admin/admins", payload);
    return data.data;
  },
  async update(id: string, payload: Record<string, unknown>) {
    const { data } = await apiClient.patch(`/admin/admins/${id}`, payload);
    return data.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/admin/admins/${id}`);
  },
};

export interface AdminChatConversation {
  id: string;
  type: "produk" | "pesanan" | "checkout" | "support";
  context: string | null;
  label?: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface AdminChatMessage {
  id: string;
  sender: "customer" | "admin";
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    kind: "product_card" | "order_card";
    name?: string;
    slug?: string;
    imageUrl?: string | null;
    price?: number;
    originalPrice?: number | null;
    orderNumber?: string;
    status?: string;
    itemsSummary?: string;
    totalAmount?: number;
  } | null;
}

export const adminChatService = {
  async listConversations(): Promise<AdminChatConversation[]> {
    const { data } = await apiClient.get("/admin/chat/conversations");
    return data.data;
  },
  async listMessages(conversationId: string): Promise<AdminChatMessage[]> {
    const { data } = await apiClient.get(`/admin/chat/conversations/${conversationId}/messages`);
    return data.data;
  },
  async sendMessage(conversationId: string, message: string): Promise<AdminChatMessage> {
    const { data } = await apiClient.post(`/admin/chat/conversations/${conversationId}/messages`, { message });
    return data.data;
  },
};
