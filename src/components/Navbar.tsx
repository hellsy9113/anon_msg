'use client';

import Link from "next/link";

import {
  useSession,
  signOut,
} from "next-auth/react";

import {
  MessageSquare,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { data: session } =
    useSession();

  const user = session?.user;

  const initials =
    user?.username?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card shadow-sm">
            <MessageSquare className="h-5 w-5" />
          </div>

          <div className="hidden flex-col sm:flex">
            <span className="text-lg font-bold leading-none">
              EchoSpace
            </span>

            <span className="text-xs text-muted-foreground">
              Anonymous messaging
            </span>
          </div>
        </Link>

        {session ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard" className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />

                Dashboard
              </Button>
            </Link>

            <div className="hidden items-center gap-3 rounded-lg border bg-card px-3 py-1.5 shadow-sm md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                {initials}
              </div>

              <div className="flex flex-col">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  Verified session
                </span>

                <span className="text-sm font-medium">
                  {user?.username ||
                    user?.email}
                </span>
              </div>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground md:hidden">
              {initials}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({
                redirect: true,
                callbackUrl: "/",
              })}
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

          </div>
        ) : (
          <Link href="/sign-in">
            <Button>
              Login
            </Button>
          </Link>
        )}

      </div>

    </header>
  );
};

export default Navbar;
