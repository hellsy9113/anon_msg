"use client";

import { useEffect } from "react";
import Link from "next/link";

import {
  MessageSquare,
  Reply,
  CircleHelp,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useMessages } from "@/hooks/useMessages";
import { useQuestions } from "@/hooks/question/useQuestion";

export default function DashboardPage() {
  const {
    messages,
    loading: messagesLoading,
    fetchMessages,
  } = useMessages();

  const {
    questions,
    loading: questionsLoading,
    fetchQuestions,
  } = useQuestions();

  useEffect(() => {
    fetchMessages();
    fetchQuestions();
  }, [fetchMessages, fetchQuestions]);

  const questionResponses = questions.reduce(
    (total, question) => total + question.totalMessages,
    0
  );

  const inboxReplies = messages.reduce(
    (total, message) => total + (message.replies?.length ?? 0),
    0
  );

  const questionReplies = questions.reduce(
    (total, question) =>
      total +
      question.messages.reduce(
        (messageTotal, message) =>
          messageTotal + (message.replies?.length ?? 0),
        0
      ),
    0
  );

  const recentMessages = [
    ...messages.map((message) => ({
      id: message._id?.toString() ?? message.replyAccessToken,
      title: "Inbox message received",
      createdAt: new Date(message.createdAt),
    })),
    ...questions.flatMap((question) =>
      question.messages.map((message) => ({
        id: message._id?.toString() ?? message.replyAccessToken,
        title: "Question response received",
        createdAt: new Date(message.createdAt),
      }))
    ),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  const isLoading = messagesLoading || questionsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground">
          Overview of your EchoSpace account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <MessageSquare className="h-8 w-8" />

            <div>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : messages.length + questionResponses}
              </p>

              <p className="text-sm text-muted-foreground">
                Total Messages
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Reply className="h-8 w-8" />

            <div>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : inboxReplies + questionReplies}
              </p>

              <p className="text-sm text-muted-foreground">
                Total Replies
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <CircleHelp className="h-8 w-8" />

            <div>
              <p className="text-2xl font-bold">
                {questionsLoading ? "..." : questions.length}
              </p>

              <p className="text-sm text-muted-foreground">
                Questions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Quick Actions
            </CardTitle>

            <CardDescription>
              Common tasks for your anonymous inbox.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Link
              href="/dashboard/default"
              className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">
                  View Inbox
                </p>

                <p className="text-sm text-muted-foreground">
                  Read incoming anonymous messages.
                </p>
              </div>

              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard/question"
              className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">
                  Manage Questions
                </p>

                <p className="text-sm text-muted-foreground">
                  Share prompts and review responses.
                </p>
              </div>

              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Recent Activity
            </CardTitle>

            <CardDescription>
              Latest messages across your inbox and questions.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading activity
              </div>
            ) : recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((item) => (
                  <div
                    key={item.id}
                    className="border-l-2 pl-4"
                  >
                    <p className="font-medium">
                      {item.title}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {item.createdAt.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No activity yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
