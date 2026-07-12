import { TrendingUp, Star, ShoppingBag, Truck, Clock } from "lucide-react";
import { Product } from "@/types/entities";

export default function PopularityBox({ product }: { product: Product }) {
  return (
    <div className="rounded-card border border-primary-100 bg-primary-50 p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-primary-500">
        <TrendingUp className="h-4 w-4" />
        Terlaris Minggu Ini
      </div>
      <ul className="mt-3 space-y-2 text-sm text-ink-700">
        <li className="flex items-center gap-2">
          <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" />
          Rating {product.rating.toFixed(1)}/5 ({product.ratingCount.toLocaleString("id-ID")} Ulasan)
        </li>
        <li className="flex items-center gap-2">
          <ShoppingBag className="h-3.5 w-3.5 text-primary-500" />
          Terjual {product.soldCount.toLocaleString("id-ID")}+
        </li>
        <li className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-primary-500" />
          Gratis Ongkir untuk pembelian minimal Rp50.000
        </li>
        <li className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary-500" />
          Estimasi Penyajian 15 Menit
        </li>
      </ul>
    </div>
  );
}
