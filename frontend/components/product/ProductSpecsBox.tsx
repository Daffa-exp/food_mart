import { Product } from "@/types/entities";

const SPICY_LABELS: Record<number, string> = {
  0: "Tidak Pedas",
  1: "Sedikit Pedas",
  2: "Pedas Sedang",
  3: "Pedas",
  4: "Sangat Pedas",
  5: "Ekstra Pedas",
};

export default function ProductSpecsBox({ product }: { product: Product }) {
  const specs = [
    ["Masa Simpan", product.shelfLifeInfo],
    ["Tanggal Produksi", product.productionInfo],
    ["Tanggal Kedaluwarsa", product.expiryInfo],
    ["Berat Produk", product.weightInfo],
    ["Porsi Sajian", product.portionInfo],
    ["Kalori", `±${product.calories} kkal`],
    ["Tingkat Kepedasan", SPICY_LABELS[product.spicyLevel]],
    ["Kondisi Produk", "Fresh Made"],
    ["Asal Produk", product.originInfo],
  ];

  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <h4 className="mb-3 text-sm font-bold text-ink-900">Informasi Produk</h4>
      <dl className="space-y-2.5">
        {specs.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <dt className="text-ink-400">{label}</dt>
            <dd className="font-medium text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
