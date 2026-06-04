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
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">

      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* Logo */}

        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted">

            <MessageSquare className="h-5 w-5" />

          </div>

          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">
              EchoSpace
            </span>

            <span className="text-xs text-muted-foreground">
              Anonymous messaging
            </span>
          </div>
        </Link>

        {/* Right Section */}

        {session ? (
          <div className="flex items-center gap-3">

            {/* Dashboard */}

            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />

                Dashboard
              </Button>
            </Link>

            {/* User */}

            <div className="hidden items-center gap-3 rounded-full border px-3 py-1.5 md:flex">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">

                {initials}

              </div>

              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Signed in as
                </span>

                <span className="text-sm font-medium">
                  {user?.username ||
                    user?.email}
                </span>
              </div>

            </div>

            {/* Mobile Avatar */}

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground md:hidden">

              {initials}

            </div>

            {/* Logout */}

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({
    redirect: true,
    callbackUrl: "/",
  })}
            >
              <LogOut className="mr-2 h-4 w-4" />

              Logout
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