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

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // Tolak lebih awal kalau param jelas bukan UUID maupun format nomor
      // order kita ("FM-2026-xxxxxx") — mis. placeholder yang belum
      // diganti nilai asli, atau salah ketik.
      const looksValid = /^[0-9a-f-]{36}$/i.test(id) || /^FM-\d{4}-\d+$/i.test(id);
      if (!looksValid) {
        return res.status(400).json({ success: false, message: "ID atau nomor order tidak valid" });
      }

      const order = await orderRepository.findById(id);
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
