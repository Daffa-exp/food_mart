// Helper untuk membentuk konteks Live Chat berdasarkan halaman asal
// (Produk, Checkout, Pesanan, atau Customer Support umum).
// Percakapan & pesan sesungguhnya disimpan lewat backend (/api/chat/*).

export type ChatContextType = "produk" | "pesanan" | "checkout" | "support";

export function sellerNameFor(type: ChatContextType): string {
  return type === "support" ? "Customer Support FoodMart" : "Admin FoodMart";
}

export function labelFor(type: ChatContextType, context?: string | null): string | undefined {
  if (type === "produk" && context) return context;
  if (type === "pesanan" && context) return `Pesanan #${context}`;
  if (type === "checkout") return "Pertanyaan Checkout";
  return undefined;
}

/** Template pesan profesional yang otomatis terisi di kolom input untuk percakapan baru */
export function buildTemplateMessage({ type, context }: { type: ChatContextType; context?: string }): string {
  switch (type) {
    case "produk":
      return `Halo, saya ingin bertanya mengenai produk "${context}".\nMohon informasinya. Terima kasih.`;
    case "pesanan":
      return `Halo, saya ingin menanyakan pesanan dengan nomor #${context}.\nMohon bantuannya. Terima kasih.`;
    case "checkout":
      return `Halo, saya ada pertanyaan sebelum melanjutkan proses checkout.\nMohon bantuannya. Terima kasih.`;
    case "support":
    default:
      return `Halo Admin FoodMart, saya ingin bertanya.\nTerima kasih.`;
  }
}
