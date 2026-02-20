import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "brand-aura overflow-hidden bg-brand-gradient text-primary-foreground shadow-soft after:absolute after:inset-y-0 after:left-[-35%] after:w-1/3 after:skew-x-[-24deg] after:bg-white/35 after:opacity-0 after:transition-all after:duration-500 hover:-translate-y-0.5 hover:shadow-pop hover:after:left-[120%] hover:after:opacity-100",
        secondary: "bg-secondary/80 text-secondary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-secondary",
        outline:
          "border border-input/80 bg-background/80 text-foreground shadow-soft hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/60",
        ghost: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:-translate-y-0.5 hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-brand-gradient text-primary-foreground shadow-pop hover:-translate-y-0.5",
        glow: "bg-primary/12 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10 rounded-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
