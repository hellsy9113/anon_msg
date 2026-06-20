"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import {
  Copy,
  KeyRound,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Send,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { messageSchema } from "@/schemas/messageSchema";

interface Question {
  _id: string;
  content: string;
  isAcceptingMessage: boolean;
}

interface Reply {
  content: string;
  createdAt: string;
}

interface ReplyData {
  originalMessage: string;
  createdAt: string;
  replies: Reply[];
}

const getStoredReplyToken = (questionId: string) => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(`reply-token-${questionId}`) ?? "";
};

export default function PublicQuestionPage() {
  const { username, questionId } = useParams<{
    username: string;
    questionId: string;
  }>();

  const [question, setQuestion] =
    useState<Question | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [fetchingReplies, setFetchingReplies] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const initialReplyToken = getStoredReplyToken(questionId);

  const [replyToken, setReplyToken] =
    useState(initialReplyToken);

  const [savedToken, setSavedToken] =
    useState(initialReplyToken);

  const [replyData, setReplyData] =
    useState<ReplyData | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(
          `/api/public-question/${username}/${questionId}`
        );

        setQuestion(response.data.question);
      } catch (error) {
        const errorMessage = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined;

        toast.error(
          errorMessage ?? "Unable to load question."
        );
      } finally {
        setLoading(false);
      }
    };

    if (username && questionId) {
      fetchQuestion();
    }
  }, [username, questionId]);

  const handleSend = async () => {
    const validationResult = messageSchema.safeParse({
      content: message,
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0]?.message ?? "Please enter a valid message.");
      return;
    }

    try {
      setSending(true);

      const response = await axios.post(
        "/api/send-message",
        {
          username,
          questionId,
          content: validationResult.data.content,
        }
      );

      toast.success(
        response.data.message
      );
      localStorage.setItem(
        `reply-token-${questionId}`,
        response.data.replyAccessToken
      );
      setReplyToken(
        response.data.replyAccessToken
      );
      setSavedToken(
        response.data.replyAccessToken
      );

      setMessage("");
    } catch (error) {
      const errorMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(
        errorMessage ?? "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      replyToken
    );

    toast.success(
      "Reply token copied."
    );
  };

  const handleViewReplies = async () => {
    if (!savedToken.trim()) {
      toast.error(
        "Enter your reply token."
      );
      return;
    }

    try {
      setFetchingReplies(true);

      const response = await axios.post(
        "/api/get-replies",
        {
          replyAccessToken: savedToken,
        }
      );

      setReplyData(
        response.data.messageData
      );

      toast.success(
        "Replies loaded."
      );
    } catch (error) {
      const errorMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(
        errorMessage ?? "Failed to fetch replies."
      );
    } finally {
      setFetchingReplies(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading question
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <MessageSquare className="h-6 w-6" />
            </div>

            <h1 className="text-xl font-semibold">
              Question not found
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This prompt may have been removed or is no longer available.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase text-muted-foreground">
            Anonymous response
          </p>

          <h1 className="text-3xl font-bold">
            @{username} asked
          </h1>
        </div>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <p className="text-lg font-semibold leading-8">
              {question.content}
            </p>
          </CardContent>
        </Card>

        {!question.isAcceptingMessage && (
          <Card className="border-amber-200 bg-amber-50/80">
            <CardContent className="p-5 text-sm text-amber-900">
              @{username} has paused responses for this question right now. You can still keep your reply token and check past replies, but new answers are closed for the moment.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              Your response
            </CardTitle>

            <CardDescription>
              Send one anonymous answer. Save the token if you want to read replies.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              rows={8}
              placeholder="Write your anonymous response..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              className="min-h-40 resize-none bg-background"
              disabled={!question.isAcceptingMessage}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {message.trim().length}/300 characters
              </p>

              <Button
                onClick={handleSend}
                disabled={
                  sending ||
                  !message.trim() ||
                  !question.isAcceptingMessage
                }
                className="sm:w-44"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Response
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-6">
        {replyToken && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="h-5 w-5 text-primary" />
                Reply token
              </CardTitle>

              <CardDescription>
                Keep this token to check for replies later.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                readOnly
                value={replyToken}
                className="font-mono text-xs"
              />

              <Button
                className="w-full"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
                Copy Token
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCcw className="h-5 w-5 text-primary" />
              View replies
            </CardTitle>

            <CardDescription>
              Paste your token to check whether @{username} responded.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="Paste your reply token..."
              value={savedToken}
              onChange={(e) =>
                setSavedToken(
                  e.target.value
                )
              }
            />

            <Button
              className="w-full"
              onClick={handleViewReplies}
              disabled={
                fetchingReplies ||
                !savedToken.trim()
              }
            >
              {fetchingReplies ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  View Replies
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {replyData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Conversation
              </CardTitle>

              <CardDescription>
                Your anonymous response and owner replies.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Your response
                </p>

                <p className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm leading-6">
                  {replyData.originalMessage}
                </p>
              </div>

              <Separator />

              {replyData.replies.length > 0 ? (
                <div className="space-y-3">
                  {replyData.replies.map(
                    (reply, index) => (
                      <div
                        key={index}
                        className="rounded-lg border p-3"
                      >
                        <p className="text-sm leading-6">
                          {reply.content}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(
                            reply.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No replies yet.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </aside>
    </main>
  );
}
