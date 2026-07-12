import { Soup, BadgeCheck } from "lucide-react";

export default function OfficialStoreBar() {
  return (
    <div className="flex items-center gap-3 rounded-card border border-surface-border bg-white p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
        <Soup className="h-5 w-5" />
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-ink-900">FoodMart Official Store</span>
        <span className="flex items-center gap-1 rounded-pill bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-500">
          <BadgeCheck className="h-3 w-3" /> Official
        </span>
      </div>
    </div>
  );
}
