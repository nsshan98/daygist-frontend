"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const menuItems = [
  { label: "Why it work", sectionId: "why-it-work" },
  { label: "Features", sectionId: "features" },
  { label: "Pricing", sectionId: "pricing" },
  { label: "Resources", sectionId: "resources" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 sm:px-6",
          isScrolled
            ? "bg-white sm:bg-transparent sm:backdrop-blur-md sm:rounded-4xl sm:shadow-lg py-2 sm:py-3 sm:w-3/4 mx-auto"
            : "bg-transparent py-4 sm:py-4"
        )}
      >
        <div className="w-full flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <Button variant={"link"} href="/" className="hover:no-underline">
              <p className="font-baumans text-3xl text-center bg-[#2445CE] text-white rounded-2xl p-2 w-12 h-12">
                P
              </p>
              <p className="font-baumans text-3xl uppercase">Protocol</p>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <ul
            className={cn(
              "hidden lg:flex transition-all duration-500 ease-in-out",
              isScrolled ? "space-x-4 lg:space-x-6" : "space-x-8 lg:space-x-12"
            )}
          >
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={`#${item.sectionId}`}
                  className={cn(
                    "relative font-medium transition-all duration-300 ease-in-out group",
                    isScrolled
                      ? "text-sm py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground"
                      : "text-base lg:text-sm py-3 px-4"
                  )}
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  {item.label}

                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 transition-all duration-300",
                      isScrolled
                        ? "w-0 group-hover:w-full"
                        : "w-full transform scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <Button
              href="/auth/login"
              className="hidden lg:inline-flex rounded-full px-6"
            >
              Login
            </Button>
            <ThemeToggle />

            <div className="lg:hidden">
              <Button
                variant="default"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="transition-all duration-300 hover:scale-110"
              >
                <div>{isMenuOpen ? <X /> : <Menu />}</div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute top-20 left-4 right-4 bg-card/95 backdrop-blur-md rounded-lg shadow-xl border transform transition-all duration-300 ${
            isMenuOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "-translate-y-4 opacity-0 scale-95"
          }`}
        >
          <nav className="flex flex-col p-6 gap-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={`#${item.sectionId}`}
                className="text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 py-3 px-4 rounded-lg border-b border-border/50 hover:border-cyan-400/30 last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button href="/auth/login" className="rounded-full px-6 m-4">
              Login
            </Button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
