export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: "admin" | "super_admin";
}

export interface DashboardSummary {
  revenue30Days: number;
  orders30Days: number;
  orderStatusCounts: Record<string, number>;
  bestSellers: { id: string; name: string; soldCount: number; price: number; imageUrl: string | null }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    recipientName: string;
    status: string;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
  }[];
  dailyRevenueChart: { date: string; total: number }[];
}

export interface AdminProduct {
  id: string;
  slug: string;
  categorySlug: string;
  categoryLabel: string;
  name: string;
  shortDescription: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  images: string[];
  rating: number;
  soldCount: number;
  isBestSeller: boolean;
  isPromo: boolean;
  isNew: boolean;
  isActive: boolean;
  stockQuantity: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  itemCount: number;
  paymentStatus: string;
  createdAt: string;
}
