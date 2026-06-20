"use client";

import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";

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

import { signUpSchema } from "@/features/auth/schemas/signupSchema";
import {
  checkUsernameUnique,
  signUpUser,
} from "@/features/auth/services/auth.service";

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const  [debouncedUsername] = useDebounceValue(username, 300);

  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameAvailability =
      async () => {
      if (!debouncedUsername) return;

      setIsCheckingUsername(true);
      setUsernameMessage("");

      try {
        const response =
          await checkUsernameUnique(
            debouncedUsername
          );

        setUsernameMessage(
          response.message
        );
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;

        setUsernameMessage(
          axiosError.response?.data.message ??
            "Error checking username"
        );
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsernameAvailability();
  }, [debouncedUsername]);

  const onSubmit = async (
    data: z.infer<typeof signUpSchema>
  ) => {
    setIsSubmitting(true);

    try {
      const response =
        await signUpUser(data);

      toast.success(response.message);

      router.replace(`/verify/${data.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      const errorMessage =
        axiosError.response?.data.message ??
        "There was a problem with your sign up. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const usernameIsAvailable =
    usernameMessage === "Username is unique";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <section className="hidden max-w-xl space-y-5 lg:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-card shadow-sm">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>

          <div>
            <p className="text-sm font-medium uppercase text-muted-foreground">
              EchoSpace
            </p>

            <h1 className="mt-2 text-4xl font-bold leading-tight">
              Create a private inbox for honest feedback.
            </h1>

            <p className="mt-4 text-muted-foreground">
              Share one public link, receive anonymous messages, and reply without asking senders to create an account.
            </p>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Create account
            </CardTitle>

            <CardDescription>
              We will send a verification code before opening your inbox.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Username
                      </FormLabel>

                      <Input
                        placeholder="john_doe"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setUsername(
                            e.target.value
                          );
                        }}
                      />

                      <div className="min-h-5">
                        {isCheckingUsername ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking username
                          </div>
                        ) : (
                          usernameMessage && (
                            <p
                              className={`flex items-center gap-1.5 text-sm ${
                                usernameIsAvailable
                                  ? "text-primary"
                                  : "text-destructive"
                              }`}
                            >
                              {usernameIsAvailable && (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              {usernameMessage}
                            </p>
                          )
                        )}
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                      </FormLabel>

                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />

                      <p className="text-xs text-muted-foreground">
                        Your verification code will be sent here.
                      </p>

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
                        placeholder="At least 8 characters"
                        {...field}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
