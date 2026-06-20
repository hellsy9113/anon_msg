"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

import {
  RefreshCcw,
  Loader2,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ProfileLink from "@/components/dashboard/ProfileLink";
import MessageCard from "@/components/MessageCard";

import { useQuestion } from "@/hooks/question/useQuestion";

export default function QuestionDashboardPage() {
  const { questionId } = useParams<{
    questionId: string;
  }>();

  const { data: session } = useSession();

  const username = session?.user?.username ?? "";

  const {
    question,
    loading,
    fetchQuestion,
    deleteMessageLocally,
  } = useQuestion(questionId);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  const profileUrl = `${baseUrl}/u/${username}/question/${questionId}`;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">
          Question not found
        </h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">

      {/* Header */}

      <Card>
        <CardContent className="py-8">
          <h1 className="text-3xl font-bold">
            {question.content}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {question.messages.length} responses
          </p>
        </CardContent>
      </Card>

      {/* Share Link */}

      <Card>
        <CardHeader>
          <CardTitle>
            Share Question
          </CardTitle>

          <CardDescription>
            Share this link to receive anonymous responses for this question.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ProfileLink
            profileUrl={profileUrl}
          />
        </CardContent>
      </Card>

      {/* Toolbar */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-semibold">
            Responses
          </h2>

          <p className="text-muted-foreground">
            View and manage anonymous responses.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchQuestion}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>

      </div>

      <Separator />

      {/* Responses */}

      {question.messages.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {question.messages.map((message) => (
            <MessageCard
              key={message._id?.toString()}
              message={message}
              onMessageDelete={deleteMessageLocally}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">

            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />

            <h3 className="text-lg font-semibold">
              No responses yet
            </h3>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Share this question to start receiving anonymous responses.
            </p>

          </CardContent>
        </Card>
      )}

    </div>
  );
}