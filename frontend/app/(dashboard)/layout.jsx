"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Nav/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import {logOut} from "@/hooks/lib/api/auth";
const API_URL = "http://localhost:8000";

export default function Layout({ children }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        // 1. First check the current access token
        const meResponse = await fetch(`${API_URL}/auth/me/`, {
          method: "GET",
          credentials: "include",
        });

        // Access token is valid
        if (meResponse.ok) {
          if (mounted) {
            setCheckingAuth(false);
          }
          return;
        }

        // 2. Access token failed, try refreshing it
        const refreshResponse = await fetch(`${API_URL}/auth/refresh/`, {
          method: "POST",
          credentials: "include",
        });

        // Refresh failed
        if (!refreshResponse.ok) {
          router.replace("/auth/login");
          return;
        }

        // 3. Refresh succeeded, verify the new access token
        const newMeResponse = await fetch(`${API_URL}/auth/me/`, {
          method: "GET",
          credentials: "include",
        });

        if (!newMeResponse.ok) {
          router.replace("/auth/login");
          return;
        }

        // Authentication is confirmed
        if (mounted) {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        router.replace("/auth/login");
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Don't render ANY dashboard content while authentication is being checked
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-foreground" />

          <p className="text-sm text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Fixed Header */}
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-5">
          {/* Left Section */}
          <div className="flex shrink-0 items-center">
            <SidebarTrigger className="h-9 w-9" />
          </div>

          {/* Search */}
          <div className="mx-3 flex flex-1 justify-center sm:mx-6">
            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                type="search"
                placeholder="Search courses, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border-border/70 bg-muted/40 pl-9 pr-9 text-sm shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:bg-background"
              />

              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearch("")}
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              className="h-9 w-9 rounded-lg"
              aria-label="Toggle theme"
            >
              <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

              <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-w-0 flex-1 py-3 pt-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}