import Link from "next/link";
import { POWER_COLOR_MAP } from "@/lib/utils";
import type { Power } from "@/lib/schemas";
import type { PowerSlug } from "@/lib/schemas";

interface PowerBadgeProps {
  power: Power;
  asLink?: boolean;
}

export default function PowerBadge({ power, asLink = true }: PowerBadgeProps) {
  const colors = POWER_COLOR_MAP[power.slug as PowerSlug];
  const className = `inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`;

  if (asLink) {
    return (
      <Link href={`/powers/${power.slug}`} className={`${className} hover:opacity-80 transition-opacity`}>
        {power.name}
      </Link>
    );
  }

  return <span className={className}>{power.name}</span>;
}
