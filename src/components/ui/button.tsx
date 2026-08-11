import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-sm font-semibold tracking-[-0.01em]",
    "transition-[background-color,border-color,color,opacity] duration-150 ease-out",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "active:scale-[0.985]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/88",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-destructive",
        outline:
          "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        warning: "bg-brass text-brass-foreground hover:bg-brass/88",
        success: "bg-leaf text-leaf-foreground hover:bg-leaf/88",
        sky: "bg-sky text-sky-foreground hover:bg-sky/88",
        /* Cancelling a booking is a quiet, deliberate action — not an error,
           and not worth a slab of red on a card. It only reddens on intent. */
        quiet:
          "border border-border bg-transparent text-muted-foreground hover:border-destructive/40 hover:bg-destructive/8 hover:text-destructive focus-visible:outline-destructive",
      },
      size: {
        /* 44px minimum on the sizes that carry primary actions — these get
           tapped with a thumb, often one-handed, often in a hurry. */
        default: "h-11 px-5",
        sm: "h-9 gap-1.5 px-3.5 text-[0.8125rem]",
        lg: "h-12 px-7 text-base",
        xl: "h-14 rounded-xl px-9 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
