"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import * as z from "zod";

import { MessageSquare, Loader2 } from "lucide-react";

import { toast } from "sonner";

import { signInSchema } from "@/schemas/signInSchema";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/10 px-4">

      {/* Background Blur */}

      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <Card className="relative w-full max-w-md border bg-background/80 shadow-2xl backdrop-blur">

        <CardHeader className="space-y-6 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">

            <MessageSquare className="h-8 w-8" />

          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome Back
            </h1>

            <p className="mt-2 text-muted-foreground">
              Sign in to access your
              anonymous message board.
            </p>
          </div>

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
                      placeholder="••••••••"
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

            </form>
          </Form>

          <div className="mt-8 text-center">

            <p className="text-sm text-muted-foreground">
              New here?
            </p>

            <Link
              href="/sign-up"
              className="mt-2 inline-block font-medium text-primary transition hover:underline"
            >
              Create an account
            </Link>

          </div>

        </CardContent>

      </Card>
    </div>
  );
}