"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

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

import {
  Send,
  Copy,
  MessageSquare,
  Loader2,
} from "lucide-react";

interface Question {
  _id: string;
  content: string;
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
        const message = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined;

        toast.error(
          message ?? "Unable to load question."
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
    if (!message.trim()) {
      toast.error(
        "Please enter a message."
      );
      return;
    }

    try {
      setSending(true);

      const response = await axios.post(
        "/api/send-message",
        {
          username,
          questionId,
          content: message,
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
      <div className="container mx-auto max-w-2xl py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto max-w-2xl py-10">
        Question not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-8 py-10">
      {/* Hero */}

      <Card>

        <CardHeader>

          <CardTitle className="text-3xl">
            Anonymous Message
          </CardTitle>

          <CardDescription>
            Send an anonymous response to{" "}
            <span className="font-semibold">
              @{username}
            </span>
          </CardDescription>

        </CardHeader>

      </Card>

      {/* Question */}

      <Card className="border-primary">

        <CardHeader>

          <CardDescription>
            Question
          </CardDescription>

          <CardTitle className="text-2xl leading-relaxed">
            {question.content}
          </CardTitle>

        </CardHeader>

      </Card>

      {/* Write Message */}

      <Card>

        <CardHeader>

          <CardTitle>
            Your Anonymous Message
          </CardTitle>

          <CardDescription>
            Your identity is never shared.
          </CardDescription>

        </CardHeader>

        <CardContent className="space-y-4">

          <Textarea
            rows={8}
            placeholder="Write your anonymous message..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
          />

          <div className="flex justify-between">

            {/* <Button
              variant="outline"
              onClick={handleSuggest}
              disabled={suggesting}
            >
              {suggesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggest Message
                </>
              )}
            </Button> */}

            <Button
              onClick={handleSend}
              disabled={
                sending ||
                !message.trim()
              }
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>

          </div>

        </CardContent>

      </Card>

      {/* Reply Token */}

      {replyToken && (

        <Card className="border-green-500">

          <CardHeader>

            <CardTitle>
              Message Sent Successfully
            </CardTitle>

            <CardDescription>
              Save this reply token carefully.
              You will need it later to
              read replies.
            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-4">

            <Input
              readOnly
              value={replyToken}
            />

            <Button
              className="w-full"
              onClick={handleCopy}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Reply Token
            </Button>

          </CardContent>

        </Card>

      )}

      {/* Reply Lookup */}

      <Card>

        <CardHeader>

          <CardTitle>
            View Replies
          </CardTitle>

          <CardDescription>
            Enter your reply token to
            check whether the owner has
            responded.
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                View Replies
              </>
            )}
          </Button>

        </CardContent>

      </Card>
      {/* Replies */}

      {replyData && (

        <Card>

          <CardHeader>

            <CardTitle>
              Conversation
            </CardTitle>

            <CardDescription>
              Your anonymous message and any replies you&apos;ve received.
            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-8">

            {/* Original Message */}

            <div className="space-y-2">

              <h3 className="font-semibold">
                Your Message
              </h3>

              <div className="rounded-lg border bg-muted/30 p-4">

                <p className="leading-relaxed">
                  {replyData.originalMessage}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  Sent on{" "}
                  {new Date(
                    replyData.createdAt
                  ).toLocaleString()}
                </p>

              </div>

            </div>

            {/* Replies */}

            <div className="space-y-4">

              <h3 className="font-semibold">
                Replies
              </h3>

              {replyData.replies.length > 0 ? (

                <div className="space-y-4">

                  {replyData.replies.map(
                    (reply, index) => (

                      <Card
                        key={index}
                        className="border-l-4"
                      >

                        <CardContent className="pt-6">

                          <p className="leading-relaxed">
                            {reply.content}
                          </p>

                          <p className="mt-3 text-xs text-muted-foreground">
                            {new Date(
                              reply.createdAt
                            ).toLocaleString()}
                          </p>

                        </CardContent>

                      </Card>

                    )
                  )}

                </div>

              ) : (

                <Card>

                  <CardContent className="flex flex-col items-center justify-center py-10">

                    <MessageSquare className="mb-4 h-10 w-10 text-muted-foreground" />

                    <h3 className="text-lg font-semibold">
                      No replies yet
                    </h3>

                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      The owner hasn&apos;t replied to your
                      anonymous message yet.
                    </p>

                  </CardContent>

                </Card>

              )}

            </div>

          </CardContent>

        </Card>

      )}

    </div>
  );
}
