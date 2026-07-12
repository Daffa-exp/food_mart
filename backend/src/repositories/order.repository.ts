import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export interface CreateOrderInput {
  userId: string;
  orderNumber: string;
  deliveryMethod: "instant" | "same_day" | "regular";
  recipientName: string;
  recipientPhone: string;
  fullAddress: string;
  addressNote?: string;
  city: string;
  postalCode: string;
  orderNote?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  serviceFee: number;
  totalAmount: number;
  couponId?: string | null;
  items: {
    productId: string;
    productName: string;
    productImageUrl?: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];
}

export const orderRepository = {
  async create(input: CreateOrderInput) {
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: input.orderNumber,
        user_id: input.userId,
        status: "pending",
        delivery_method: input.deliveryMethod,
        recipient_name: input.recipientName,
        recipient_phone: input.recipientPhone,
        full_address: input.fullAddress,
        address_note: input.addressNote,
        city: input.city,
        postal_code: input.postalCode,
        order_note: input.orderNote,
        subtotal: input.subtotal,
        shipping_fee: input.shippingFee,
        discount_amount: input.discountAmount,
        service_fee: input.serviceFee,
        total_amount: input.totalAmount,
        coupon_id: input.couponId ?? null,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new AppError(`Gagal membuat order: ${orderError?.message}`, 500);
    }

    const orderItemsPayload = input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image_url: item.productImageUrl,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItemsPayload);
    if (itemsError) {
      // Rollback manual — Supabase JS client tidak mendukung transaction multi-table,
      // jadi hapus order yang sudah terlanjur dibuat agar tidak jadi data yatim.
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new AppError(`Gagal menyimpan item order: ${itemsError.message}`, 500);
    }

    return order;
  },

  async findById(orderIdOrNumber: string) {
    // Nomor order (mis. "FM-2026-897375") adalah satu-satunya identifier yang
    // ditampilkan ke user di seluruh UI — id asli (UUID) tidak pernah
    // terlihat. Supaya lookup pakai nomor order (mis. saat user
    // copy-paste dari halaman riwayat pesanan) tidak berujung error 500 dari
    // Postgres (invalid input syntax for type uuid), deteksi dulu formatnya
    // dan cari berdasarkan kolom yang sesuai.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      orderIdOrNumber
    );

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .eq(isUuid ? "id" : "order_number", orderIdOrNumber)
      .maybeSingle();

    if (error) throw new AppError(`Gagal mengambil order: ${error.message}`, 500);
    if (!data) throw new AppError("Order tidak ditemukan", 404);
    return data;
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new AppError(`Gagal mengambil riwayat order: ${error.message}`, 500);
    return data ?? [];
  },

  async listForAdmin(params: {
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*), payments(*), users(full_name, email)", { count: "exact" });

    if (params.status) query = query.eq("status", params.status);
    if (params.search) query = query.ilike("order_number", `%${params.search}%`);
    if (params.dateFrom) query = query.gte("created_at", params.dateFrom);
    if (params.dateTo) query = query.lte("created_at", params.dateTo);

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) throw new AppError(`Gagal mengambil daftar order: ${error.message}`, 500);
    return { data: data ?? [], total: count ?? 0, page, pageSize };
  },

  async updateStatus(orderId: string, status: string) {
    const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", orderId);
    if (error) throw new AppError(`Gagal memperbarui status order: ${error.message}`, 500);
  },

  async generateOrderNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `FM-${year}-${random}`;
  },
};
