"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  KeyRound,
  Link2,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import messages from "@/messages.json";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading EchoSpace
        </div>
      </div>
    );
  }

  if (status === "authenticated") return null;

  const steps = [
    {
      icon: Link2,
      title: "Share one link",
      desc: "Your public profile accepts anonymous messages without extra setup.",
    },
    {
      icon: MessageCircle,
      title: "Reply privately",
      desc: "Senders keep a token so they can read replies later.",
    },
    {
      icon: KeyRound,
      title: "Keep control",
      desc: "Pause your inbox and manage focused question links from the dashboard.",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6">
      <section className="grid flex-1 gap-8 py-1 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Anonymous by default
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
            EchoSpace
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            A focused inbox for honest anonymous messages, private replies, and question-based feedback links.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Get your link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">
                Open dashboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                Live inbox preview
              </p>

              <p className="text-xs text-muted-foreground">
                Sample anonymous messages
              </p>
            </div>

            <span className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
              New
            </span>
          </div>

          <div className="space-y-3">
            {messages.slice(0, 4).map((msg) => (
              <div
                key={msg.title}
                className="rounded-lg border bg-background/70 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {msg.title}
                  </span>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {msg.received}
                  </span>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 border-t py-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>

            <p className="text-sm font-semibold">
              {title}
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {desc}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
