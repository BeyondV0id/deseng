"use client"

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// The main region's topbar. The sidebar is a column above `lg` and steps out
// below it, where the bar's own menu carries the destinations, so the header
// holds only what the page puts in it: no rail, no toggle, no trigger.
// ---------------------------------------------------------------------------

export function SidebarInsetTopbar({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn("flex h-12 shrink-0 items-center gap-2 px-1.5", className)}
    >
      {children}
    </header>
  );
}
