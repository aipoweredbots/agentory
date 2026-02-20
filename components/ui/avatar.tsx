"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

export function Avatar({ className, ...props }: AvatarPrimitive.AvatarProps) {
  return <AvatarPrimitive.Root className={className} {...props} />;
}

export function AvatarImage(props: AvatarPrimitive.AvatarImageProps) {
  return <AvatarPrimitive.Image {...props} />;
}

export function AvatarFallback({ className, ...props }: AvatarPrimitive.AvatarFallbackProps) {
  return <AvatarPrimitive.Fallback className={className} {...props} />;
}
