import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* Badges in this app are read at a glance while scrolling a phone, so they
   are set in mono at a small size with wide tracking rather than as filled
   pills — closer to a stamp on a ticket than a notification bubble. */
const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap",
    "rounded-md border font-mono font-medium uppercase tracking-[0.1em]",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border bg-secondary text-muted-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        success: "border-leaf/35 bg-leaf/12 text-leaf",
        warning: "border-brass/35 bg-brass/12 text-brass",
        pending: "border-brass/35 bg-brass/12 text-brass",
        info: "border-primary/35 bg-primary/12 text-primary",
        sky: "border-sky/35 bg-sky/12 text-sky",
        /* Void, not error: a cancelled booking is a fact, not a failure. */
        cancelled: "border-border bg-muted text-muted-foreground",
      },
      size: {
        default: "px-2 py-0.5 text-[0.6875rem]",
        sm: "px-1.5 py-0.5 text-[0.625rem]",
        lg: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
