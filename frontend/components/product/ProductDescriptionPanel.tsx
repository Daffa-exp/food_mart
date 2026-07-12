import { Product } from "@/types/entities";

export default function ProductDescriptionPanel({ product }: { product: Product }) {
  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      {product.description.split("\n\n").map((paragraph, i) => (
        <p key={i} className="mb-3 text-sm leading-relaxed text-ink-700 last:mb-0">
          {paragraph}
        </p>
      ))}

      <div className="mt-5">
        <h4 className="mb-2 text-sm font-bold text-ink-900">Komposisi</h4>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-ink-700">
          {product.composition.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h4 className="mb-2 text-sm font-bold text-ink-900">Cara Menyimpan</h4>
        <p className="text-sm leading-relaxed text-ink-700">{product.storageInfo}</p>
      </div>
    </div>
  );
}
