import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:ring-ring/50 flex min-h-28 w-full rounded-[24px] border bg-[#0b141e] px-4 py-3 text-sm shadow-none transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
