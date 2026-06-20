"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ShieldCheck, Link2, MessageCircle, Sparkles } from "lucide-react";
import messages from "@/messages.json";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBFF]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (status === "authenticated") return null;

  const steps = [
    {
      icon: Link2,
      title: "Get your link",
      desc: "One unique link. Share it anywhere. No setup required.",
    },
    {
      icon: MessageCircle,
      title: "They message you",
      desc: "Senders stay anonymous — no accounts, no tracking.",
    },
    {
      icon: Sparkles,
      title: "Grow from truth",
      desc: "Real feedback unlocks growth you can't find elsewhere.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBFF] font-sans">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 78% 8%, rgba(167,139,250,.13) 0%, transparent 48%), radial-gradient(circle at 12% 82%, rgba(99,60,180,.07) 0%, transparent 42%)",
        }}
      />

      <div className="relative z-10 flex flex-col">

        {/* Navbar */}
     
        {/* Hero */}
        <section className="flex flex-col items-center px-6 pb-12 pt-16 text-center md:px-10 md:pt-20">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium tracking-wide text-violet-700">
            <ShieldCheck className="h-3 w-3" />
            100% anonymous · zero identity leaks
          </span>

          <h1 className="mb-5 max-w-2xl text-4xl font-medium leading-tight tracking-tight text-[#1a0533] md:text-6xl">
            Feedback that tells{" "}
            <span className="text-violet-600">the whole truth.</span>
          </h1>

          <p className="mb-9 max-w-md text-base leading-relaxed text-[#6B5E8A] md:text-lg">
            Share and receive brutally honest feedback — your identity stays
            completely hidden, forever.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/sign-up">
              <button className="rounded-full bg-[#1a0533] px-8 py-3.5 text-base font-medium text-violet-100 transition hover:bg-[#2d0a52] active:scale-95">
                Get your link free →
              </button>
            </Link>
        
          </div>
        </section>

        {/* Stats */}
    

        {/* Live message */}
        <section className="px-6 pb-12 md:px-10">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-violet-300">
            Live message coming in
          </p>
          <div className="flex flex-col gap-3">
            {messages.slice(0, 3).map((msg, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-[#EDE9FE] bg-[#F9F7FF] p-4 transition hover:border-violet-300"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-medium text-violet-700">
                  AN
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1a0533]">
                      {msg.title}
                    </span>
                    <span className="text-xs text-violet-300">
                      {msg.received}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#5B4A7A]">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 pb-12 md:px-10">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-violet-300">
            How it works
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-[#E8E4FF] bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-400"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
                    <Icon className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="mb-1.5 text-sm font-medium text-[#1a0533]">
                    {title}
                  </div>
                  <div className="text-sm leading-relaxed text-[#9580BB]">
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <div className="relative mx-6 mb-8 overflow-hidden rounded-2xl bg-[#1a0533] p-8 text-center md:mx-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 90% 20%, rgba(167,139,250,.2) 0%, transparent 50%)",
            }}
          />
          <div className="relative">
            <h2 className="mb-2 text-xl font-medium text-violet-100">
              Ready to hear the truth?
            </h2>
            <p className="mb-6 text-sm text-[#9580BB]">
              Join 12,000+ people getting real, anonymous feedback.
            </p>
            <Link href="/sign-up">
              <button className="rounded-full bg-violet-600 px-8 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-700 active:scale-95">
                Create free account →
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-[#F0EBFF] px-6 py-4 md:px-10">
          <span className="text-xs text-violet-300">© 2026 TrueFeedback</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-xs text-violet-300 hover:text-violet-600">Privacy</Link>
            <Link href="/terms" className="text-xs text-violet-300 hover:text-violet-600">Terms</Link>
          </div>
        </footer>

      </div>
    </div>
  );
}