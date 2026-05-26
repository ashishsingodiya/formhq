import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4 shrink-0">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <p className="text-muted-foreground text-sm">
          Welcome to FormHQ. Head to Forms to get started.
        </p>
        <Button asChild size="sm">
          <Link href="/dashboard/forms">Go to Forms</Link>
        </Button>
      </div>
    </div>
  );
}
