"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import {
  Home,
  SquarePlay,
  Compass,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  LogOut,
  TrendingUp,
  Hash,
  Users,
} from "lucide-react";
import { logout } from "@/lib/logout";

const navItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Reels", icon: SquarePlay, active: false, href: "/reels" },
  { label: "Explore", icon: Compass, active: false },
  { label: "Groups", icon: Users, active: false, href: "/groups" },
  { label: "Saved", icon: Bookmark, active: false, href: "/saved-posts" },
  { label: "Profile", icon: User, active: false, href: "/profile" },
];

const trendingTopics = [
  "#Technology",
  "#Travel",
  "#Food",
  "#Photography",
  "#Fitness",
];

export function Sidebar() {
  return (
    <div className="sticky top-8 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto pr-1">
      {/* Main Navigation */}
      <Card className="border-none shadow-2xl backdrop-blur-sm bg-linear-to-br from-card/90 to-card/60 overflow-hidden">
        {/* Decorative accent */}
        <CardContent className="p-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.label}
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start text-base font-medium transition-all duration-300 rounded-xl h-12 relative group ${
                    item.active 
                      ? 'shadow-lg hover:shadow-xl hover:scale-[1.02] bg-linear-to-r from-primary/90 to-primary' 
                      : 'hover:bg-primary/10 hover:text-primary'
                  }`}
                  asChild
                >
                  <Link href={item.href || "#"}>
                    {/* Active indicator line */}
                    {item.active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-linear-to-b from-secondary to-primary rounded-r-full" />
                    )}
                                  
                    <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${
                      item.active ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                                  
                    <span className="flex-1 text-left">{item.label}</span>
                                  
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="pt-4 mt-4 border-t border-border/30">
            <Button
              variant="ghost"
              className="w-full justify-start text-base font-medium hover:bg-destructive/10 hover:text-destructive rounded-xl h-12"
            >
              <Settings className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">Settings</span>
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start text-base font-medium hover:bg-destructive/10 hover:text-destructive rounded-xl h-12 cursor-pointer"
              onClick={async () => {
                await logout();
              }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">Logout</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      {/* <Card className="border-none shadow-2xl backdrop-blur-sm bg-linear-to-br from-card/90 to-card/60 overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-secondary via-primary to-secondary" />
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-linear-to-br from-red-500 to-orange-500 animate-pulse shadow-lg shadow-orange-500/50" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Trending Now
              </h3>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary">
              See all
            </Button>
          </div>
          
          <div className="space-y-2">
            {trendingTopics.map((tag, index) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="w-full justify-between py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-linear-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:scale-[1.02] hover:shadow-md group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-base font-medium">{tag.replace('#', '')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {(Math.random() * 10 + 1).toFixed(1)}k posts
                </div>
              </Badge>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary/5 hover:border-primary/50"
          >
            <Hash className="w-4 h-4 mr-2" />
            Explore more topics
          </Button>
        </CardContent>
      </Card> */}

      {/* Footer Links */}
      <Card className="border-none shadow-xl backdrop-blur-sm bg-linear-to-br from-card/50 to-card/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary hover:underline transition-all duration-300">About</a>
            <a href="#" className="hover:text-primary hover:underline transition-all duration-300">Help</a>
            <a href="#" className="hover:text-primary hover:underline transition-all duration-300">Privacy</a>
            <a href="#" className="hover:text-primary hover:underline transition-all duration-300">Terms</a>
            <a href="#" className="hover:text-primary hover:underline transition-all duration-300">Cookies</a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            © 2026 Daygist, Inc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
