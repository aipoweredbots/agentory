"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({ className, ...props }: DropdownMenuPrimitive.DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={8}
        className={cn("z-50 min-w-[12rem] rounded-xl border border-border/70 bg-card/95 p-1.5 shadow-pop backdrop-blur-xl", className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: DropdownMenuPrimitive.DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors focus:bg-accent/70 focus:text-accent-foreground",
        className
      )}
      {...props}
    />
  );
}

export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
