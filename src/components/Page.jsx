import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "../pages/ComComponent/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Every signed-in screen is the same shape: sticky bar, a measured column,
 * and enough bottom room to clear the phone's nav bar and home indicator.
 */
export function Page({ children, width = "default", className }) {
  const widths = {
    default: "max-w-6xl",
    narrow: "max-w-3xl",
    wide: "max-w-7xl",
  };

  // No min-height here: <main> in the layout is the flex child that grows, so
  // repeating a viewport height at this level would push the footer a full
  // screen below the fold on every short page.
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div
        className={cn(
          "mx-auto w-full flex-1 px-4 pt-6 pb-10 sm:px-6 md:pt-8",
          widths[width],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The header states what the screen is and one line of fact about it —
 * a count, a status — rather than a sentence selling the screen to someone
 * who already navigated here on purpose.
 */
export function PageHeader({ title, meta, action }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border pb-5">
      <div className="min-w-0">
        <h1 className="display text-[1.7rem] uppercase sm:text-[2.1rem]">
          {title}
        </h1>
        {meta && (
          <p className="label-mono mt-2 text-muted-foreground">{meta}</p>
        )}
      </div>
      {action}
    </header>
  );
}

export function BackLink({ to, onClick, children = "Back" }) {
  const props = to ? { asChild: true } : { onClick };
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 mb-4 text-muted-foreground hover:text-foreground"
      {...props}
    >
      {to ? (
        <Link to={to}>
          <ChevronLeft className="size-4" />
          {children}
        </Link>
      ) : (
        <>
          <ChevronLeft className="size-4" />
          {children}
        </>
      )}
    </Button>
  );
}

/**
 * An empty screen is an invitation to act, so it always carries the next move.
 */
export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      {Icon && (
        <Icon className="mb-4 size-7 text-muted-foreground" aria-hidden="true" />
      )}
      <h2 className="text-base font-semibold">{title}</h2>
      {body && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * Errors say what happened and what to do about it. They don't apologise and
 * they aren't vague.
 */
export function ErrorState({ title = "Couldn't load this", body, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/35 px-6 py-16 text-center">
      <span className="label-mono text-destructive">Error</span>
      <h2 className="mt-3 text-base font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {body || "Check your connection and try again."}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-6"
        onClick={onRetry || (() => window.location.reload())}
      >
        Try again
      </Button>
    </div>
  );
}

/** Price, always in the same register: mono numerals, rupee as a glyph. */
export function Price({ amount, className, size = "md" }) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  if (amount === 0 || amount === null || amount === undefined) {
    return (
      <span className={cn("numeral font-bold text-leaf", sizes[size], className)}>
        Free
      </span>
    );
  }

  return (
    <span className={cn("numeral font-bold", sizes[size], className)}>
      <span className="opacity-55">₹</span>
      {amount}
    </span>
  );
}
