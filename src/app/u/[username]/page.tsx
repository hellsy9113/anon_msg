"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCompletion } from "@ai-sdk/react";
import { Loader2 } from "lucide-react";
import * as z from "zod";

import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";

const SPECIAL_CHAR = "||";

const INITIAL_MESSAGES =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

const parseMessages = (messageString: string): string[] => {
  return messageString
    .split(SPECIAL_CHAR)
    .filter((message) => message.trim() !== "");
};

export default function SendMessage() {
  const params = useParams<{ username: string }>();

  const username = params.username;

  const [isSending, setIsSending] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const messageContent = form.watch("content") || "";

  const {
    completion,
    complete,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: INITIAL_MESSAGES,
  });

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const fetchSuggestedMessages = async () => {
    try {
      await complete("");
    } catch (error) {
      console.error("Suggestion error:", error);

      toast.error("Failed to fetch suggestions");
    }
  };

  const onSubmit = async (
    data: z.infer<typeof messageSchema>
  ) => {
    setIsSending(true);

    try {
      const response = await axios.post<ApiResponse>(
        "/api/send-message",
        {
          ...data,
          username,
        }
      );

      toast.success(response.data.message);

      form.reset({
        content: "",
      });

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error(
        axiosError.response?.data.message ??
          "Failed to send message"
      );

    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto my-10 max-w-4xl px-4">
      <Card className="shadow-xl">
        
        <CardHeader>
          <h1 className="text-center text-4xl font-bold tracking-tight">
            Public Profile
          </h1>

          <p className="text-center text-muted-foreground mt-2">
            Send anonymous messages to @{username}
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          
          {/* Message Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Your Anonymous Message
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder="Write your message here..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={
                    isSending || !messageContent.trim()
                  }
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* Suggestions */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              
              <Button
                type="button"
                onClick={fetchSuggestedMessages}
                disabled={isSuggestLoading}
                variant="secondary"
              >
                {isSuggestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  "Suggest Messages"
                )}
              </Button>

              <p className="text-sm text-muted-foreground">
                Click a suggestion to use it.
              </p>
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">
                  Suggested Messages
                </h3>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {error ? (
                  <p className="text-sm text-red-500">
                    {error.message}
                  </p>
                ) : (
                  parseMessages(completion).map(
                    (message, index) => (
                      <Button
                        key={`${message}-${index}`}
                        type="button"
                        variant="outline"
                        className="justify-start whitespace-normal h-auto py-3"
                        onClick={() =>
                          handleMessageClick(message)
                        }
                      >
                        {message}
                      </Button>
                    )
                  )
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Want your own anonymous message board?
            </p>

            <Link href="/sign-up">
              <Button>Create Your Account</Button>
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}