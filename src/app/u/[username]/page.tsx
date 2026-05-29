"use client";

import React, { useEffect, useState } from "react";

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

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";

/* -------------------------------- */
/* Types */
/* -------------------------------- */

interface Reply {
  content: string;
  createdAt: string;
}

interface MessageData {
  originalMessage: string;
  createdAt: string;
  replies: Reply[];
}

/* -------------------------------- */
/* Constants */
/* -------------------------------- */

const SPECIAL_CHAR = "||";

const INITIAL_MESSAGES =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

/* -------------------------------- */
/* Helper */
/* -------------------------------- */

const parseMessages = (messageString: string): string[] => {
  return messageString
    .split(SPECIAL_CHAR)
    .filter((message) => message.trim() !== "");
};

/* -------------------------------- */
/* Component */
/* -------------------------------- */

export default function SendMessage() {
  /* ------------------------------ */
  /* Dynamic username from route */
  /* ------------------------------ */

  const params = useParams<{
    username: string;
  }>();

  const username = params.username;

  /* ------------------------------ */
  /* Local states */
  /* ------------------------------ */

  const [isSending, setIsSending] = useState(false);

  const [replyAccessToken, setReplyAccessToken] = useState("");

  const [messageData, setMessageData] = useState<MessageData | null>(null);

  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  /* ------------------------------ */
  /* Form setup */
  /* ------------------------------ */

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),

    defaultValues: {
      content: "",
    },
  });

  const messageContent = form.watch("content") || "";

  /* ------------------------------ */
  /* AI Suggested messages */
  /* ------------------------------ */

  const {
    completion,
    complete,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",

    initialCompletion: INITIAL_MESSAGES,
  });

  /* ------------------------------ */
  /* Suggestion click handler */
  /* ------------------------------ */

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  /* ------------------------------ */
  /* Generate AI suggestions */
  /* ------------------------------ */

  const fetchSuggestedMessages = async () => {
    try {
      await complete("");
    } catch (error) {
      console.error("Suggestion error:", error);

      toast.error("Failed to fetch suggestions");
    }
  };

  /* ------------------------------ */
  /* Fetch replies using token */
  /* ------------------------------ */

  const fetchReplies = async (token: string) => {
    try {
      setIsLoadingReplies(true);

      const response = await axios.post("/api/get-replies", {
        replyAccessToken: token,
      });

      setMessageData(response.data.messageData);
    } catch (error) {
      console.error("Reply fetch error:", error);

      toast.error("Failed to fetch replies");
    } finally {
      setIsLoadingReplies(false);
    }
  };

  /* ------------------------------ */
  /* Load previous token from localStorage
     so sender can revisit replies
  */
  /* ------------------------------ */

  useEffect(() => {
    const storedTokens = JSON.parse(
      localStorage.getItem("replyTokens") || "[]",
    );

    /* 
       Find latest token related to
       current username
    */

    const latestToken = storedTokens.find(
      (item: any) => item.username === username,
    );

    if (latestToken) {
      setReplyAccessToken(latestToken.token);

      fetchReplies(latestToken.token);
    }
  }, [username]);

  /* ------------------------------ */
  /* Form submit */
  /* ------------------------------ */

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSending(true);

    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast.success(response.data.message);

      /* -------------------------- */
      /* Get token returned by API */
      /* -------------------------- */

      const token = response.data.replyAccessToken;

      setReplyAccessToken(token as string);

      /* -------------------------- */
      /* Store tokens locally
         so sender can revisit
         replies later
      */
      /* -------------------------- */

      const existingTokens = JSON.parse(
        localStorage.getItem("replyTokens") || "[]",
      );

      existingTokens.push({
        token,
        username,
        originalMessage: data.content,

        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("replyTokens", JSON.stringify(existingTokens));

      /* -------------------------- */
      /* Fetch replies immediately */
      /* -------------------------- */

      fetchReplies(token as string);

      /* -------------------------- */
      /* Reset form */
      /* -------------------------- */

      form.reset({
        content: "",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error(
        axiosError.response?.data.message ?? "Failed to send message",
      );
    } finally {
      setIsSending(false);
    }
  };

  /* -------------------------------- */
  /* UI */
  /* -------------------------------- */

  return (
    <div className="container mx-auto my-10 max-w-4xl px-4">
      <Card className="shadow-xl">
        {/* -------------------------- */}
        {/* Header */}
        {/* -------------------------- */}

        <CardHeader>
          <h1 className="text-center text-4xl font-bold tracking-tight">
            Public Profile
          </h1>

          <p className="text-center text-muted-foreground mt-2">
            Send anonymous messages to @{username}
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* -------------------------- */}
          {/* Message Form */}
          {/* -------------------------- */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Anonymous Message</FormLabel>

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
                  disabled={isSending || !messageContent.trim()}
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

          {/* -------------------------- */}
          {/* Suggestions */}
          {/* -------------------------- */}

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
                <h3 className="text-xl font-semibold">Suggested Messages</h3>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {error ? (
                  <p className="text-sm text-red-500">{error.message}</p>
                ) : (
                  parseMessages(completion).map((message, index) => (
                    <Button
                      key={`${message}-${index}`}
                      type="button"
                      variant="outline"
                      className="justify-start whitespace-normal h-auto py-3"
                      onClick={() => handleMessageClick(message)}
                    >
                      {message}
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* -------------------------- */}
          {/* Reply Access Section */}
          {/* -------------------------- */}

          {replyAccessToken && (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Reply Access</h3>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Save this token to revisit replies later.
                </p>

                <div className="rounded bg-muted p-3 break-all font-mono text-sm">
                  {replyAccessToken}
                </div>

                <Button
                  type="button"
                  onClick={() => fetchReplies(replyAccessToken)}
                  disabled={isLoadingReplies}
                >
                  {isLoadingReplies ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Replies
                    </>
                  ) : (
                    "Refresh Replies"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* -------------------------- */}
          {/* Replies Section */}
          {/* -------------------------- */}

          {messageData && (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Replies</h3>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Original message */}

                <div className="rounded border p-4">
                  <p className="font-medium">Your Message</p>

                  <p className="mt-2 text-muted-foreground">
                    {messageData.originalMessage}
                  </p>
                </div>

                {/* Replies */}

                {messageData.replies.length === 0 ? (
                  <p className="text-muted-foreground">No replies yet.</p>
                ) : (
                  messageData.replies.map((reply, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <p>{reply.content}</p>

                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* -------------------------- */}
          {/* CTA */}
          {/* -------------------------- */}

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
