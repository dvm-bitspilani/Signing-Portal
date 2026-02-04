import { Link, useLocation } from "react-router-dom";
import { getAccessToken, getUserDetails } from "../assets/utils/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  ShoppingBag,
  Ticket,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const token = getAccessToken();
  const { username, profilePicURL } = getUserDetails();

  // Don't show on sign-in page or when not authenticated
  if (!token || location.pathname === "/signin") {
    return null;
  }

  const navItems = [
    { 
      to: "/", 
      label: "Merch", 
      icon: ShoppingBag,
      activeOn: ["/"] 
    },
    { 
      to: "/events", 
      label: "Events", 
      icon: Calendar,
      activeOn: ["/events", "/EventDetails"] 
    },
    { 
      to: "/yoursignings", 
      label: "Signings", 
      icon: Ticket,
      activeOn: ["/yoursignings"] 
    },
    { 
      to: "/profile", 
      label: "Profile", 
      icon: User,
      activeOn: ["/profile", "/contact"],
      isProfile: true
    },
  ];

  const isActive = (item) => {
    if (item.activeOn.includes(location.pathname)) return true;
    return item.activeOn.some(path => 
      path !== "/" && location.pathname.startsWith(path)
    );
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Backdrop blur container */}
      <div className="glass border-t border-border/40 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item);
            const IconComponent = item.icon;
            
            // Profile item uses avatar instead of icon
            if (item.isProfile) {
              return (
                <Link
                  key={item.to}
                  to="/contact"
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-16 rounded-xl transition-all duration-200",
                    active 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <div className="relative">
                    <Avatar className={cn(
                      "h-6 w-6 ring-2 transition-all duration-200",
                      active 
                        ? "ring-primary" 
                        : "ring-transparent"
                    )}>
                      <AvatarImage src={profilePicURL} alt={username} />
                      <AvatarFallback className="text-[10px]">
                        <User className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    {active && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-all duration-200",
                    active && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-16 rounded-xl transition-all duration-200",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <div className="relative">
                  <IconComponent 
                    className={cn(
                      "h-6 w-6 transition-all duration-200",
                      active && "scale-110"
                    )} 
                    strokeWidth={active ? 2.5 : 2}
                    aria-hidden="true"
                  />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  active && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
