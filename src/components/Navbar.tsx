'use client';

import React from "react";
import Link from "next/link";

import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const Navbar = () => {
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <Card className="rounded-none border-0 shadow-none">
        <CardContent className="flex h-16 items-center justify-between px-6">
          
          {/* Logo */}
          <div
            className="text-2xl font-bold tracking-tight"
          >
            Mystery Message
          </div>

          {/* Right Side */}
          {session ? (
            <div className="flex items-center gap-4">
              
              {/* Welcome Text */}
              <div className="hidden sm:flex flex-col text-sm">
                <span className="text-muted-foreground">
                  Welcome back
                </span>

                <span className="font-medium">
                  {user?.username || user?.email}
                </span>
              </div>

              {/* Logout Button */}
              <Button
                variant="destructive"
                onClick={() => signOut()}
              >
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
        </CardContent>
      </Card>
    </header>
  );
};

export default Navbar;