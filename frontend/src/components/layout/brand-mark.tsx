import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  compact?: boolean;
  to?: string;
}

export function BrandMark({ compact = false, to = "/" }: BrandMarkProps) {
  return (
    <Link className="inline-flex items-center gap-3" to={to}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-[#ff9d42] text-[#09111b]",
          compact ? "size-8" : "size-9"
        )}
      >
        <Plane className={cn(compact ? "size-3.5" : "size-4")} />
      </span>

      <span className="flex min-w-0 flex-col">
        <span className="font-display text-[1.55rem] leading-none tracking-[-0.04em] text-[#f6efe3]">
          Altitude
        </span>
        <span className="mt-1 text-[0.62rem] uppercase tracking-[0.42em] text-[#8f8a83]">
          In-Flight Cinema
        </span>
      </span>
    </Link>
  );
}
