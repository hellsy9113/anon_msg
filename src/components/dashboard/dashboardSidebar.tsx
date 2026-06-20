"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  MessageSquare,
  Reply,
} from "lucide-react";

import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Messages",
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
    <aside className="w-64 border-r bg-background">
      <div className="border-b px-6 py-5">
        <h2 className="text-xl font-bold">
          EchoSpace
        </h2>
      </div>

      <nav className="p-3">
        <div className="space-y-1">
          {routes.map((route) => {
            const Icon = route.icon;

            const isActive =
              pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
