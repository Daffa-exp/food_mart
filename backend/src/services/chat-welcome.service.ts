import { productRepository } from "../repositories/product.repository";
import { orderRepository } from "../repositories/order.repository";
import { ChatContextType } from "../repositories/chat.repository";

export interface WelcomeMessage {
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Bangun pesan sambutan otomatis dari "Admin FoodMart" begitu sebuah
 * percakapan BARU dibuat, supaya baik admin maupun customer sama-sama
 * langsung tahu produk/pesanan apa yang sedang dibicarakan (tidak perlu
 * tanya "produk yang mana ya kak?").
 */
export async function buildWelcomeMessages(
  type: ChatContextType,
  context: string | undefined,
  referenceId: string | undefined
): Promise<WelcomeMessage[]> {
  if (type === "produk" && referenceId) {
    try {
      const product = await productRepository.getByIdForAdmin(referenceId);
      if (product) {
        const images = (product.images as Array<{ image_url: string; is_primary: boolean }>) ?? [];
        const primaryImage = images.find((i) => i.is_primary)?.image_url ?? images[0]?.image_url ?? null;
        return [
          {
            message: `Halo! Terima kasih sudah menghubungi Admin FoodMart mengenai produk berikut ini. Ada yang bisa kami bantu? 😊`,
            metadata: {
              kind: "product_card",
              name: product.name,
              slug: product.slug,
              imageUrl: primaryImage,
              price: product.final_price,
              originalPrice: product.discount_percentage > 0 ? product.price : null,
            },
          },
        ];
      }
    } catch {
      // Produk tidak ketemu -> lanjut ke sambutan generik di bawah.
    }
  }

  if (type === "pesanan" && referenceId) {
    try {
      const order = await orderRepository.findById(referenceId);
      if (order) {
        const items = (order.order_items as Array<{ product_name: string; quantity: number; product_image_url: string | null }>) ?? [];
        const itemsSummary = items.map((i) => `${i.quantity}x ${i.product_name}`).join(", ");
        return [
          {
            message: `Halo! Terima kasih sudah menghubungi Admin FoodMart mengenai pesanan berikut ini. Ada yang bisa kami bantu? 😊`,
            metadata: {
              kind: "order_card",
              orderNumber: order.order_number,
              status: order.status,
              itemsSummary,
              totalAmount: order.total_amount,
              imageUrl: items[0]?.product_image_url ?? null,
            },
          },
        ];
      }
    } catch {
      // Order tidak ketemu -> lanjut ke sambutan generik di bawah.
    }
  }

  if (type === "checkout") {
    return [
      {
        message:
          "Halo! Terima kasih sudah menghubungi Admin FoodMart. Ada pertanyaan sebelum menyelesaikan pesananmu? Silakan sampaikan, kami bantu secepatnya 😊",
      },
    ];
  }

  return [
    {
      message:
        "Halo, selamat datang di Customer Support FoodMart. Ada yang bisa kami bantu hari ini? 😊",
    },
  ];
}
