import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<"label">>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-semibold leading-none tracking-wide text-foreground/90", className)} {...props} />
));
Label.displayName = "Label";

export { Label };
