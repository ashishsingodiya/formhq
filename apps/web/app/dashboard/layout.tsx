"use client";

import { FileText, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { useLogout } from "~/hooks/api/auth";
import { cn } from "~/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Forms", href: "/dashboard/forms", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutAsync, isPending } = useLogout();

  const handleLogout = async () => {
    await logoutAsync({});
    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r flex flex-col bg-background">
        {/* Brand */}
        <div className="px-4 py-5 border-b">
          <Link href="/" className="font-semibold text-base tracking-tight">
            FormHQ
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === href
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2.5 px-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            disabled={isPending}
          >
            <LogOut className="size-4 shrink-0" />
            {isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
