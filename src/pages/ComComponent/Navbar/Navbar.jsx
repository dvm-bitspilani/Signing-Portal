import { React, useState } from "react";
import { Link } from "react-router-dom";
import SignInContext from "../../../assets/store/SignInContext";
import { AppContext } from "../../../App";
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
  Menu, 
  X, 
  Calendar,
  ShoppingBag,
  Ticket, 
  Phone, 
  LogOut, 
  User 
} from "lucide-react";

const Navbar = () => {
  const submit = useSubmit();
  const { username, profilePicURL } = getUserDetails();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link to="/" className="nav-brand flex items-center space-x-3 transition-all duration-300 hover:scale-105 hover:text-primary">
            <img src="https://res.cloudinary.com/dhrbeqvcw/image/upload/v1760900997/logo2_r7itzj.png" alt="Logo" className="h-8 w-8 transition-transform duration-300 hover:rotate-12" />
            <span className="nav-brand font-bold">Signings Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {token ? (
              <>
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="nav-link relative px-3 py-2 rounded-md transition-all duration-300 hover:bg-primary/10 hover:shadow-sm hover:scale-105 flex items-center space-x-2"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                <div className="relative">
                  <ThemeToggle />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-md hover:bg-primary/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profilePicURL || "/default-profile.png"} alt={username} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-background/80 backdrop-blur-md border border-border/20 shadow-lg" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="nav-text-muted">Welcome,</p>
                        <p className="text-label">{username || "Guest"}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={signOut} 
                      className="text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <ThemeToggle />
                </div>
                <Link to="/contact" className="nav-link px-3 py-2 rounded-md transition-all duration-300 hover:bg-primary/10 hover:shadow-sm flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Contact</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {!token && (
              <div className="relative">
                <ThemeToggle />
              </div>
            )}
            {token ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="transition-all duration-300 hover:bg-primary/10 hover:scale-105"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            ) : (
              <Link to="/contact" className="nav-link px-3 py-2 rounded-md transition-all duration-300 hover:bg-primary/10 flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && token && (
          <div className="md:hidden border-t border-border/20 bg-background/80 backdrop-blur-md">
            <div className="space-y-4 py-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 px-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profilePicURL || "/default-profile.png"} alt={username} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="nav-text-muted">Welcome,</p>
                  <p className="text-label">{username || "Guest"}</p>
                </div>
              </div>
              
              {/* Navigation Links */}
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="nav-link flex items-center space-x-3 px-2 py-2 rounded-md mx-2 transition-all duration-300 hover:bg-primary/10 hover:scale-105"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              {/* Theme Toggle */}
              <div className="pt-2 border-t border-border/20">
                <div className="flex items-center justify-between px-2 py-2">
                  <span className="text-label">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
              
              {/* Logout Button */}
              <div className="pt-2 border-t border-border/20">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
