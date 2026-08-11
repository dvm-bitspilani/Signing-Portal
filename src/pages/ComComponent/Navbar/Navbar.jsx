import { Link, useLocation, useSubmit } from "react-router-dom";
import { getAccessToken, getUserDetails } from "../../../assets/utils/auth";
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
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Events" },
  { to: "/merch", label: "Merch" },
  { to: "/yoursignings", label: "Your signings" },
  { to: "/contact", label: "Help" },
];

export function BrandMark({ className }) {
  return (
    <img
      src="/oasis-logo.svg"
      alt=""
      draggable="false"
      className={cn(
        // The mark is five saturated colours on transparent. On warm paper the
        // yellow disappears, so light mode prints it on an ink chip.
        "select-none rounded-md bg-foreground object-contain p-1 dark:bg-transparent dark:p-0",
        className,
      )}
    />
  );
}

const Navbar = () => {
  const submit = useSubmit();
  const location = useLocation();
  const { username, profilePicURL } = getUserDetails();
  const token = getAccessToken();

  const signOut = () => {
    submit({ token }, { method: "post", action: "/logout" });
  };

  const isActive = (path) => {
    if (path === "/")
      return location.pathname === "/" || location.pathname === "/events";
    return location.pathname.startsWith(path);
  };

  const AccountMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="size-9 rounded-full p-0 hover:bg-transparent"
          aria-label="Account"
        >
          <Avatar className="size-9 border border-border">
            <AvatarImage src={profilePicURL} alt="" />
            <AvatarFallback className="bg-muted">
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" sideOffset={10}>
        <div className="px-2 py-2.5">
          <p className="label-mono text-muted-foreground">Signed in</p>
          <p className="mt-1 truncate text-sm font-semibold">
            {username || "Guest"}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer gap-2">
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:h-16 md:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md py-1 transition-opacity hover:opacity-75"
          >
            <BrandMark className="size-7 md:size-8" />
            <span className="flex items-baseline gap-1.5">
              <span className="display text-[0.95rem] uppercase md:text-base">
                Oasis
              </span>
              <span className="label-mono text-muted-foreground">Signings</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {token &&
              NAV_LINKS.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative px-3 py-2 text-sm transition-colors",
                      "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full",
                      active
                        ? "font-semibold text-foreground after:bg-primary"
                        : "font-medium text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {token ? (
              <AccountMenu />
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/contact">Help</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
      {/* The Oasis palette, once per screen. */}
      <div className="brand-rule h-0.5 w-full" aria-hidden="true" />
    </header>
  );
};

export default Navbar;
