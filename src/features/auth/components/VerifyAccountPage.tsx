"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { verifySchema } from "@/features/auth/schemas/verifySchema";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  verifyAccountCode,
} from "@/features/auth/services/auth.service";

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

const VerifyAccount = () => {
  const router = useRouter();
  const param = useParams<{ username: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      setIsSubmitting(true);

      await verifyAccountCode({
        username: param.username,
        code: data.code,
      });

      toast.success(
        "Account verified. Redirecting to sign in.",
      );
      router.replace("/sign-in");
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border bg-card shadow-sm">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>

          <CardTitle className="text-2xl">
            Verify your account
          </CardTitle>

          <CardDescription>
            Enter the 6 digit code sent to your email for @{param.username}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                name="code"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <Input
                      inputMode="numeric"
                      placeholder="123456"
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
                    Verifying
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Code expired?{" "}
                <Link
                  href="/sign-up"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up again
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
};

export default VerifyAccount;
