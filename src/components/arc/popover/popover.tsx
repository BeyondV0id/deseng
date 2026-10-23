"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Elevated } from "@/lib/elevated";
import styles from "./popover.module.css";

export const Popover = PopoverPrimitive.Root;
export const PopoverClose = PopoverPrimitive.Close;

/** The trigger anchors the panel, so it opts out of press-scale: a scaled rect measured on open would shift the panel as the trigger springs back. */
export const PopoverTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(function PopoverTrigger({ className, ...props }, ref) {
  return <PopoverPrimitive.Trigger {...props} ref={ref} className={[styles.anchor, className].filter(Boolean).join(" ")}/>;
});

PopoverTrigger.displayName = "PopoverTrigger";

/** The panel is one step above whatever it opened from, so a popover inside a
 *  dialog stays above that dialog instead of melting into it. */
export const PopoverContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, align = "start", sideOffset = 6, collisionPadding = 10, children, ...props }, ref) {
  return <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      {...props}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={styles.content}
    >
      <Elevated offset={2} ref={ref} className={[styles.panel, className].filter(Boolean).join(" ")}>{children}</Elevated>
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>;
});

PopoverContent.displayName = "PopoverContent";
