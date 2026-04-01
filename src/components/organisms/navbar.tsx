"use client";

import { useState } from "react";
import { 
  Search, 
  Home, 
  Compass, 
  Bell, 
  Mail, 
  PlusSquare, 
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";

interface NavbarProps {
  user?: {
    name: string;
    username: string;
    avatar?: string;
  };
}

const Navbar = ({ user }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left Section - Logo */}
          <div className="flex items-center gap-2 min-w-fit">
            <Button variant={"link"} href="/" className="hover:no-underline p-0">
              <p className="font-baumans text-3xl text-center bg-[#2445CE] text-white rounded-2xl p-2 w-12 h-12">
                D
              </p>
              <p className="font-baumans text-3xl uppercase ml-2 hidden sm:block">Daygist</p>
            </Button>
          </div>

          {/* Center Section - Search Bar */}
          <div className="flex-1 max-w-xl hidden sm:block">
            <div className={cn(
              "relative transition-all duration-300",
              searchFocused ? "scale-105" : "scale-100"
            )}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search....."
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-full border-2 transition-all duration-300 bg-muted/50",
                  searchFocused 
                    ? "border-primary bg-background shadow-lg" 
                    : "border-border hover:border-muted-foreground/30"
                )}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <Button variant="ghost" size="icon" className="sm:hidden rounded-full">
              <Search className="w-5 h-5" />
            </Button>

            {/* Home */}
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full hover:bg-primary/10 hover:text-primary">
              <Link href="/">
                <Home className="w-6 h-6" />
              </Link>
            </Button>

            {/* Explore */}
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full hover:bg-primary/10 hover:text-primary">
              <Link href="/explore">
                <Compass className="w-6 h-6" />
              </Link>
            </Button>

            {/* Create Post */}
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full hover:bg-primary/10 hover:text-primary">
              <PlusSquare className="w-6 h-6" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" asChild className="relative rounded-full hover:bg-primary/10 hover:text-primary">
              <Link href="/notifications">
                <Bell className="w-6 h-6" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-card">
                  3
                </Badge>
              </Link>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="icon" asChild className="relative rounded-full hover:bg-primary/10 hover:text-primary hidden sm:inline-flex">
              <Link href="/messages">
                <Mail className="w-6 h-6" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-card">
                  12
                </Badge>
              </Link>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile or Login */}
            {user ? (
              <Button variant="ghost" asChild className="rounded-full p-1 hover:bg-primary/10">
                <Link href="/profile">
                  <Avatar className="w-9 h-9 border-2 border-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            ) : (
              <Button asChild className="rounded-full px-6 hidden sm:inline-flex">
                <Link href="/auth/login">
                  Login
                </Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden rounded-full"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 top-16 z-40 sm:hidden transition-all duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-background/95 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute top-0 left-0 right-0 bg-card border-b border-border transform transition-all duration-300 ${
            isMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          }`}
        >
          <nav className="flex flex-col p-4 gap-2">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search....."
                className="w-full pl-10 pr-4 py-3 rounded-full border-2 bg-muted/50"
                onClick={() => setIsMenuOpen(false)}
              />
            </div>

            {/* Navigation Items */}
            {[
              { label: "Home", icon: Home, href: "/" },
              { label: "Explore", icon: Compass, href: "/explore" },
              { label: "Notifications", icon: Bell, href: "/notifications", badge: 3 },
              { label: "Messages", icon: Mail, href: "/messages", badge: 12 },
              { label: "Profile", icon: PlusSquare, href: "/profile" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start text-base font-medium py-4 px-4 rounded-xl hover:bg-primary/10 hover:text-primary"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href={item.href}>
                    <Icon className="w-6 h-6 mr-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge className="h-6 w-6 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}

            {/* Auth Buttons */}
            {!user && (
              <div className="pt-4 mt-4 border-t border-border">
                <Button asChild className="w-full rounded-full py-6 text-base">
                  <Link href="/auth/login">
                    Login
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
