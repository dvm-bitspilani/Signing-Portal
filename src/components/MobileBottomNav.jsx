import { Link, useLocation } from "react-router-dom";
import { getAccessToken } from "../assets/utils/auth";
import { Calendar, LifeBuoy, ShoppingBag, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Events", icon: Calendar, match: ["/", "/events", "/EventDetails"] },
  { to: "/merch", label: "Merch", icon: ShoppingBag, match: ["/merch"] },
  { to: "/yoursignings", label: "Signings", icon: Ticket, match: ["/yoursignings"] },
  // Labelled for what it gives you, not for what it is: /contact is the list
  // of people who can unstick a booking.
  { to: "/contact", label: "Help", icon: LifeBuoy, match: ["/contact"] },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const token = getAccessToken();

  if (!token || location.pathname === "/signin") return null;

  const isActive = (item) =>
    item.match.some((path) =>
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path),
    );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/92 pb-safe backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <ul className="flex h-16 items-stretch">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {/* The active marker sits on the top edge, reading as a tab
                    pulled out of the bar rather than a floating dot. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-5 top-0 h-0.5 rounded-full transition-colors",
                    active ? "bg-primary" : "bg-transparent",
                  )}
                />
                <Icon
                  className="size-[1.35rem]"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "text-[0.6875rem] leading-none",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
