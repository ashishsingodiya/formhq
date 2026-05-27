"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useUser } from "~/hooks/api/auth";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const isLoggedIn = !!user?.id;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-base tracking-tight w-32">
            FormHQ
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <a
              href="https://formhq-api.ashish.pro/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              API Docs
            </a>
          </nav>

          <div className="flex items-center gap-3 w-32 justify-end">
            {isLoggedIn ? (
              <Button size="sm" asChild className="gap-1.5">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <p className="font-semibold text-sm mb-3">FormHQ</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Beautiful, customizable forms for everyone.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Product
              </p>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/explore"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Explore
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Developers
              </p>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href="https://formhq-api.ashish.pro/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    API Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Account
              </p>
              <ul className="flex flex-col gap-2">
                {isLoggedIn ? (
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/login"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Log in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/signup"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Sign up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} FormHQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
