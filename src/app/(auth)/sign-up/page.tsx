'use client';

import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { signUpSchema } from '@/schemas/signupSchema';

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const  [debouncedUsername] = useDebounceValue(username, 300);

  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (!debouncedUsername) return;

      setIsCheckingUsername(true);
      setUsernameMessage('');

      try {
        const response = await axios.get<ApiResponse>(
          `/api/check-username-unique?username=${debouncedUsername}`
        );

        setUsernameMessage(response.data.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;

        setUsernameMessage(
          axiosError.response?.data.message ??
            'Error checking username'
        );
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsernameUnique();
  }, [debouncedUsername]);

  const onSubmit = async (
    data: z.infer<typeof signUpSchema>
  ) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post<ApiResponse>(
        '/api/sign-up',
        data
      );

      toast.success(response.data.message);

      router.replace(`/verify/${data.username}`);
    } catch (error) {
      console.error('Error during sign up:', error);

      const axiosError = error as AxiosError<ApiResponse>;

      const errorMessage =
        axiosError.response?.data.message ??
        'There was a problem with your sign up. Please try again.';

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

 return (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">

    {/* Floating blobs */}

    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

    <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

    {/* Floating message cards */}

    <div className="absolute left-10 top-32 hidden rotate-[-8deg] rounded-xl border bg-background/80 px-5 py-3 shadow-lg backdrop-blur lg:block">
      💬 You inspire me.
    </div>

    <div className="absolute right-16 top-40 hidden rotate-6 rounded-xl border bg-background/80 px-5 py-3 shadow-lg backdrop-blur lg:block">
      💬 Keep going!
    </div>

    <div className="absolute bottom-40 left-24 hidden rotate-3 rounded-xl border bg-background/80 px-5 py-3 shadow-lg backdrop-blur lg:block">
      💬 What&#39;s your dream?
    </div>

    <div className="absolute bottom-24 right-32 hidden rotate-[-5deg] rounded-xl border bg-background/80 px-5 py-3 shadow-lg backdrop-blur lg:block">
      💬 You&#39;re amazing.
    </div>

    {/* Main Card */}

    <div className="relative z-10 w-full max-w-md">

      <div className="rounded-3xl border bg-background/80 p-8 shadow-2xl backdrop-blur">

        {/* Brand */}

        <div className="mb-8 text-center">

          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
            💬
          </div>

          <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-transparent">
            EchoSpace
          </h1>

          <p className="mt-3 text-muted-foreground">
            Create your anonymous inbox and
            start receiving honest feedback.
          </p>

        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Username */}

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

                  <div className="min-h-[20px]">

                    {isCheckingUsername ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">

                        <Loader2 className="h-4 w-4 animate-spin" />

                        Checking username...

                      </div>
                    ) : (
                      usernameMessage && (
                        <p
                          className={`text-sm ${
                            usernameMessage ===
                            "Username is unique"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {usernameMessage}
                        </p>
                      )
                    )}

                  </div>

                  <FormMessage />

                </FormItem>
              )}
            />

            {/* Email */}

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
                    We&#39;ll send a verification
                    code to this email.
                  </p>

                  <FormMessage />

                </FormItem>
              )}
            />

            {/* Password */}

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
              className="w-full h-11 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

          </form>
        </Form>

        <div className="mt-8 text-center">

          <p className="text-sm text-muted-foreground">
            Already have an account?
          </p>

          <Link
            href="/sign-in"
            className="mt-2 inline-block font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>

        </div>

      </div>

    </div>

  </div>
);
}