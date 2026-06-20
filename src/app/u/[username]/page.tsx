"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useCompletion } from "@ai-sdk/react";
import {
  KeyRound,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Send,
  Wand2,
} from "lucide-react";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";

interface Reply {
  content: string;
  createdAt: string;
}

interface MessageData {
  originalMessage: string;
  createdAt: string;
  replies: Reply[];
}

interface ReplyTokenRecord {
  username: string;
  token: string;
  originalMessage?: string;
  createdAt?: string;
}

const SPECIAL_CHAR = "||";

const INITIAL_MESSAGES =
  "What is something I do well?||What should I improve next?||What would you tell me honestly?";

const parseMessages = (messageString: string): string[] => {
  return messageString
    .split(SPECIAL_CHAR)
    .map((message) => message.trim())
    .filter(Boolean);
};

const getLatestReplyToken = (username: string): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const storedTokens = JSON.parse(
    localStorage.getItem("replyTokens") || "[]",
  ) as ReplyTokenRecord[];

  return storedTokens.findLast((item) => item.username === username)?.token ?? "";
};

export default function SendMessage() {
  const params = useParams<{
    username: string;
  }>();

  const username = params.username;

  const [isSending, setIsSending] = useState(false);
  const [replyAccessToken, setReplyAccessToken] = useState(() =>
    getLatestReplyToken(username),
  );
  const [manualToken, setManualToken] = useState("");
  const [messageData, setMessageData] = useState<MessageData | null>(null);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const messageContent = useWatch({
    control: form.control,
    name: "content",
  }) || "";

  const {
    completion,
    complete,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: INITIAL_MESSAGES,
  });

  const suggestions = parseMessages(completion || INITIAL_MESSAGES);

  const fetchSuggestedMessages = async () => {
    try {
      await complete("");
    } catch {
      toast.error("Failed to fetch suggestions");
    }
  };

  const fetchReplies = async (token: string) => {
    try {
      setIsLoadingReplies(true);

      const response = await axios.post("/api/get-replies", {
        replyAccessToken: token,
      });

      setMessageData(response.data.messageData);

      return response.data.messageData as MessageData;
    } catch (error) {
      const errorMessage = axios.isAxiosError<ApiResponse>(error)
        ? error.response?.data.message
        : undefined;

      toast.error(errorMessage ?? "Failed to fetch replies");
      return null;
    } finally {
      setIsLoadingReplies(false);
    }
  };

  useEffect(() => {
    if (!replyAccessToken) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        fetchReplies(replyAccessToken);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [replyAccessToken]);

  const handleManualTokenFetch = async () => {
    const token = manualToken.trim();

    if (!token) {
      toast.error("Please enter a token");
      return;
    }

    const data = await fetchReplies(token);

    if (!data) return;

    const existingToken = JSON.parse(
      localStorage.getItem("replyTokens") || "[]",
    ) as ReplyTokenRecord[];

    const exists = existingToken.some((item) => item.token === token);

    if (!exists) {
      existingToken.push({
        username,
        token,
        originalMessage: data.originalMessage,
        createdAt: new Date().toISOString(),
      });
    }

    localStorage.setItem("replyTokens", JSON.stringify(existingToken));
    setReplyAccessToken(token);
    setManualToken("");
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSending(true);

    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast.success(response.data.message);

      const token = response.data.replyAccessToken;

      if (!token) {
        throw new Error("Reply access token missing from response");
      }

      setReplyAccessToken(token);

      const existingTokens = JSON.parse(
        localStorage.getItem("replyTokens") || "[]",
      ) as ReplyTokenRecord[];

      existingTokens.push({
        token,
        username,
        originalMessage: data.content,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("replyTokens", JSON.stringify(existingTokens));
      await fetchReplies(token);

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

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase text-muted-foreground">
            Public profile
          </p>

          <h1 className="text-3xl font-bold">
            Send an anonymous message to @{username}
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Your identity is not shared. Keep your token after sending if you want to read future replies.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Your message
            </CardTitle>

            <CardDescription>
              Write something specific and respectful.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Message
                      </FormLabel>

                      <FormControl>
                        <Textarea
                          placeholder="Write your anonymous message..."
                          className="min-h-40 resize-none bg-background"
                          {...field}
                        />
                      </FormControl>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Minimum 10 characters</span>
                        <span>{messageContent.trim().length}/300</span>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchSuggestedMessages}
                    disabled={isSuggestLoading}
                  >
                    {isSuggestLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Suggest
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSending || !messageContent.trim()}
                    className="sm:w-44"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive sm:col-span-3">
              {error.message}
            </div>
          ) : (
            suggestions.map((message, index) => (
              <button
                key={`${message}-${index}`}
                type="button"
                onClick={() => form.setValue("content", message)}
                className="rounded-lg border bg-card p-3 text-left text-sm leading-6 shadow-sm transition hover:border-primary/40 hover:bg-accent/40"
              >
                {message}
              </button>
            ))
          )}
        </div>
      </section>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-primary" />
              Reply access
            </CardTitle>

            <CardDescription>
              Use a saved token to check whether @{username} replied.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {replyAccessToken && (
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Current token
                </p>

                <p className="mt-2 break-all font-mono text-xs">
                  {replyAccessToken}
                </p>
              </div>
            )}

            <Textarea
              placeholder="Paste reply token..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="min-h-24 resize-none bg-background"
            />

            <Button
              type="button"
              onClick={handleManualTokenFetch}
              disabled={isLoadingReplies}
              className="w-full"
            >
              {isLoadingReplies ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  View Replies
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {messageData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Conversation
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Your message
                </p>

                <p className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm leading-6">
                  {messageData.originalMessage}
                </p>
              </div>

              <Separator />

              {messageData.replies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No replies yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {messageData.replies.map((reply, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-3"
                    >
                      <p className="text-sm leading-6">
                        {reply.content}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-sm font-medium">
              Want your own anonymous inbox?
            </p>

            <Button asChild variant="outline" className="w-full">
              <Link href="/sign-up">
                Create account
              </Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
