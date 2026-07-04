import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;

        return (
          <button
            key={starValue}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition-colors",
              readonly ? "cursor-default" : "hover:bg-amber-100"
            )}
            disabled={readonly}
            onClick={() => onChange?.(starValue)}
            type="button"
          >
            <Star
              className={cn(
                "size-5",
                active ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
