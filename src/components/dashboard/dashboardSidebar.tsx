"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  MessageSquare,
  Reply,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "General",
    href: "/dashboard/default",
    icon: MessageSquare,
  },
  {
    label: "Question",
    href: "/dashboard/question",
    icon: Reply,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="rounded-lg border bg-card p-3 shadow-sm lg:sticky lg:top-20">
        <div className="hidden border-b px-3 pb-4 pt-2 lg:block">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Workspace
          </p>
          <h2 className="mt-1 text-xl font-bold">
            EchoSpace
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Anonymous replies enabled
          </p>
        </div>

        <nav className="lg:pt-3">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:space-y-1">
            {routes.map((route) => {
              const Icon = route.icon;

              const isActive =
                pathname === route.href ||
                (route.href !== "/dashboard" && pathname.startsWith(route.href));

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {route.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
