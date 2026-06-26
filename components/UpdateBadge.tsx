import { UPDATE_CATEGORY_MAP, formatDateShort } from "@/lib/utils";
import type { UpdateLog } from "@/lib/schemas";

interface UpdateBadgeProps {
  update: UpdateLog;
  variant?: "default" | "light";
}

export default function UpdateBadge({ update, variant = "default" }: UpdateBadgeProps) {
  const cat = UPDATE_CATEGORY_MAP[update.category];

  if (variant === "light") {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-slate-300">
        <span className="bg-white/20 px-2 py-0.5 rounded-full">{cat.label}</span>
        <span>{formatDateShort(update.date)} 更新</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-xs text-slate-500">
      <span className={`px-2 py-0.5 rounded-full font-medium ${cat.color}`}>{cat.label}</span>
      <span>{formatDateShort(update.date)}</span>
      <span className="text-slate-400">—</span>
      <span>{update.summary}</span>
    </div>
  );
}
