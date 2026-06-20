"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { Loader2, LogIn, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { signInSchema } from "@/schemas/signInSchema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function SignInForm() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const form = useForm<
    z.infer<typeof signInSchema>
  >({
    resolver: zodResolver(
      signInSchema
    ),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (
    data: z.infer<typeof signInSchema>
  ) => {
    try {
      setIsSubmitting(true);

      const result = await signIn(
        "credentials",
        {
          identifier: data.identifier,
          password: data.password,
          redirect: false,
        }
      );

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        "Welcome back!"
      );

      router.replace("/dashboard");
    } catch {
      toast.error(
        "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="hidden max-w-xl space-y-5 lg:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-card shadow-sm">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>

          <div>
            <p className="text-sm font-medium uppercase text-muted-foreground">
              EchoSpace
            </p>

            <h1 className="mt-2 text-4xl font-bold leading-tight">
              Return to your anonymous feedback workspace.
            </h1>

            <p className="mt-4 text-muted-foreground">
              Read incoming messages, reply through saved tokens, and manage prompts from one quiet dashboard.
            </p>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Sign in
            </CardTitle>

            <CardDescription>
              Use your username or email to access your inbox.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  onSubmit
                )}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Username or Email
                      </FormLabel>

                      <Input
                        placeholder="john_doe"
                        {...field}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password
                      </FormLabel>

                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
