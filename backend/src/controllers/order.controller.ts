import { Request, Response, NextFunction } from "express";
import { createOrderSchema } from "../validators/order.validator";
import { productRepository } from "../repositories/product.repository";
import { userRepository } from "../repositories/user.repository";
import { orderRepository } from "../repositories/order.repository";
import { paymentRepository } from "../repositories/payment.repository";
import { couponRepository, calculateCouponDiscount } from "../repositories/coupon.repository";
import { midtransService } from "../services/midtrans.service";
import { getPricingSettings, calculateShippingFeeFromSettings } from "../utils/pricing";
import { AppError } from "../middlewares/errorHandler";

export const orderController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createOrderSchema.parse(req.body);

      // 1. Ambil harga & stok ASLI dari database — abaikan harga dari client.
      const productIds = payload.items.map((i) => i.productId);
      const products = await productRepository.getByIds(productIds);
      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItems = payload.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product || !product.is_active) {
          throw new AppError(`Produk tidak tersedia: ${item.productId}`, 400);
        }
        const stock = Array.isArray(product.inventory)
          ? product.inventory[0]?.stock_quantity ?? 0
          : (product.inventory as unknown as { stock_quantity: number })?.stock_quantity ?? 0;

        if (stock < item.quantity) {
          throw new AppError(`Stok "${product.name}" tidak cukup (sisa ${stock})`, 400);
        }

        const unitPrice = Number(product.final_price ?? product.price);
        const lineSubtotal = unitPrice * item.quantity;
        subtotal += lineSubtotal;

        return {
          productId: item.productId,
          productName: product.name as string,
          unitPrice,
          quantity: item.quantity,
          subtotal: lineSubtotal,
        };
      });

      // 2. Hitung ongkir & kupon (ongkir & biaya layanan diambil dinamis dari
      //    tabel `settings`, sesuai yang diatur admin di Admin Panel)
      const pricing = await getPricingSettings();
      const shippingFeeBeforeCoupon = calculateShippingFeeFromSettings(pricing, payload.deliveryMethod, subtotal);
      let discountAmount = 0;
      let shippingFee = shippingFeeBeforeCoupon;
      let couponId: string | null = null;

      if (payload.couponCode) {
        const coupon = await couponRepository.findValidByCode(payload.couponCode);
        const result = calculateCouponDiscount(coupon, subtotal, shippingFeeBeforeCoupon);
        if (result.error) throw new AppError(result.error, 400);
        couponId = coupon?.id ?? null;

        if (result.freeShipping) {
          shippingFee = 0;
          discountAmount = shippingFeeBeforeCoupon; // ditampilkan sebagai diskon ongkir
        } else {
          discountAmount = result.discountAmount;
        }
      }

      const finalTotal = subtotal + shippingFee + pricing.serviceFee - discountAmount;

      // 3. Cari user (dijamin ada — req.user wajib berkat middleware requireAuth
      //    di order.routes.ts; guest checkout sengaja tidak didukung lagi).
      const user = await userRepository.findOrCreateByAuthId(req.user!.authId);

      // 4. Simpan order + order_items
      const orderNumber = await orderRepository.generateOrderNumber();
      const order = await orderRepository.create({
        userId: user.id,
        orderNumber,
        deliveryMethod: payload.deliveryMethod,
        recipientName: payload.fullName,
        recipientPhone: payload.phoneNumber,
        fullAddress: payload.fullAddress,
        addressNote: payload.addressNote,
        city: payload.city,
        postalCode: payload.postalCode,
        orderNote: payload.orderNote,
        subtotal,
        shippingFee,
        discountAmount,
        serviceFee: pricing.serviceFee,
        totalAmount: finalTotal,
        couponId,
        items: orderItems,
      });

      // 5. Siapkan item untuk Midtrans
const midtransItems = [
  ...orderItems.map((i) => ({
    id: i.productId,
    name: i.productName,
    price: Math.round(i.unitPrice),
    quantity: i.quantity,
  })),
];

// Tambahkan ongkir jika ada
if (shippingFee > 0) {
  midtransItems.push({
    id: "SHIPPING",
    name: "Biaya Pengiriman",
    price: Math.round(shippingFee),
    quantity: 1,
  });
}

// Tambahkan biaya layanan jika ada
if (pricing.serviceFee > 0) {
  midtransItems.push({
    id: "SERVICE",
    name: "Biaya Layanan",
    price: Math.round(pricing.serviceFee),
    quantity: 1,
  });
}

// Tambahkan diskon sebagai nilai negatif
if (discountAmount > 0) {
  midtransItems.push({
    id: "DISCOUNT",
    name: "Diskon",
    price: -Math.round(discountAmount),
    quantity: 1,
  });
}

// Cek apakah total item sudah sama dengan total pembayaran
const itemTotal = midtransItems.reduce(
  (total, item) => total + item.price * item.quantity,
  0
);

console.log("Gross Amount :", finalTotal);
console.log("Items Total  :", itemTotal);
console.table(midtransItems);

// Generate Snap Token
const snap = await midtransService.createSnapTransaction({
  orderId: order.order_number,
  internalOrderId: order.id,
  grossAmount: Math.round(finalTotal),
  customer: {
    firstName: payload.fullName,
    email: payload.email,
    phone: payload.phoneNumber,
  },
  items: midtransItems,
});

      await paymentRepository.create({
        orderId: order.id,
        snapToken: snap.token,
        grossAmount: finalTotal,
      });

      res.status(201).json({
        success: true,
        message: "Order berhasil dibuat",
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          snapToken: snap.token,
          totalAmount: finalTotal,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * "Bayar Sekarang" — dipanggil dari halaman Riwayat Pesanan / Menunggu
   * Pembayaran saat customer sempat menutup popup Snap sebelum selesai.
   * Snap token lama biasanya sudah kedaluwarsa, jadi di sini kita minta
   * token BARU ke Midtrans untuk order_number yang SAMA (bukan bikin order
   * baru) — supaya stok/harga yang sudah dikunci di order awal tetap valid,
   * dan customer tidak perlu ulang isi form checkout dari nol.
   */
  async resumePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findOrCreateByAuthId(req.user!.authId);
      const order = await orderRepository.findById(req.params.id);

      if (order.user_id !== user.id) {
        throw new AppError("Pesanan ini bukan milik akun Anda", 403);
      }
      if (order.status !== "pending") {
        throw new AppError("Pesanan ini sudah tidak bisa dibayar ulang", 400);
      }

      const payment = order.payments?.[0];
      if (!payment) throw new AppError("Data pembayaran untuk pesanan ini tidak ditemukan", 404);
      if (payment.status !== "pending") {
        throw new AppError(`Pesanan ini sudah berstatus "${payment.status}", tidak bisa dibayar ulang`, 400);
      }

      // PENTING: Midtrans MENOLAK bikin transaksi Snap baru dengan order_id
      // yang sama persis dengan transaksi yang sudah pernah dibuat
      // sebelumnya (walau transaksi lamanya masih pending) — kalau tetap
      // pakai order.order_number apa adanya di sini, Midtrans akan
      // menolaknya dan endpoint ini gagal dengan error server. Makanya
      // dibuat order_id BARU (order_number asli + suffix unik) khusus
      // untuk percobaan bayar ulang ini. Suffix disimpan di kolom
      // payments.midtrans_order_id supaya webhook tetap bisa menemukan
      // order yang benar nanti.
      const midtransOrderId = `${order.order_number}-R${Date.now().toString(36).toUpperCase()}`;

      // Item detail disederhanakan jadi satu baris (bukan rekonstruksi
      // rincian ongkir/diskon/biaya layanan seperti saat createOrder) —
      // supaya tidak ada risiko total baru meleset dari total_amount yang
      // sudah tersimpan di order. Nama produk asli tetap ditampilkan di
      // aplikasi kita sendiri (order detail), Midtrans di sini cuma perlu
      // tahu total tagihannya.
      const snap = await midtransService.createSnapTransaction({
        orderId: midtransOrderId,
        internalOrderId: order.id,
        grossAmount: Math.round(Number(order.total_amount)),
        customer: {
          firstName: order.recipient_name,
          email: req.user!.email,
          phone: order.recipient_phone,
        },
        items: [
          {
            id: order.order_number,
            name: `Pembayaran Pesanan #${order.order_number}`,
            price: Math.round(Number(order.total_amount)),
            quantity: 1,
          },
        ],
      });

      await paymentRepository.updateSnapToken(payment.id, snap.token, midtransOrderId);

      res.json({ success: true, data: { snapToken: snap.token } });
    } catch (err) {
      next(err);
    }
  },

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderRepository.findById(req.params.id);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findOrCreateByAuthId(req.user!.authId);
      const orders = await orderRepository.findByUserId(user.id);
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  },
};
