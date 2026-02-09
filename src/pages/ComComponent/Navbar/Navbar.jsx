import { React } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAccessToken, getUserDetails } from "../../../assets/utils/auth";
import { useSubmit } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "../../../components/theme-toggle";
import {
  Calendar,
  ShoppingBag,
  Ticket,
  Phone,
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const submit = useSubmit();
  const location = useLocation();
  const { username, profilePicURL } = getUserDetails();
  const token = getAccessToken();

  const signOut = () => {
    submit({ token }, { method: "post", action: "/logout" });
  };

  const navLinks = [
    { to: "/", label: "Merch", icon: ShoppingBag },
    { to: "/events", label: "Events", icon: Calendar },
    { to: "/yoursignings", label: "Your Signings", icon: Ticket },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link
            to="/"
            className="flex items-center gap-3 transition-all duration-200 hover:opacity-80"
          >
            <img
              src="https://ca.bits-apogee.org/assets/apogee-logo-b58bcc05.svg"
              alt="Signings Portal Logo"
              draggable="false"
              className="h-9 w-9 select-none rounded-lg bg-gradient-to-br from-violet-950/95 via-blue-900/95 to-purple-900/95 p-1.5 dark:bg-none dark:p-0 transition-all"
              style={{ userSelect: "none", WebkitUserDrag: "none" }}
            />
            <span className="text-lg font-bold tracking-tight">
              Signings Portal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {token ? (
              <>
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <IconComponent className="h-4 w-4" aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                <div className="ml-2 flex items-center gap-2">
                  <ThemeToggle />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/20"
                        aria-label="User menu"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profilePicURL || "/default-profile.png"} alt={username} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 glass"
                      align="end"
                      forceMount
                    >
                      <div className="flex items-center gap-3 p-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profilePicURL} alt={username} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Signed in as</span>
                          <span className="text-sm font-semibold truncate max-w-[140px]">
                            {username || "Guest"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={signOut}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link
                  to="/contact"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span>Contact</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Logo + Theme Toggle + Profile (navigation moved to bottom) */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {token && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0"
                    aria-label="User menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profilePicURL} alt={username} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 glass mr-2"
                  align="end"
                  forceMount
                >
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profilePicURL} alt={username} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Signed in as</span>
                      <span className="text-sm font-semibold truncate max-w-[140px]">
                        {username || "Guest"}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
