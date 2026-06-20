"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import {
  Loader2,
  MessageSquare,
  RefreshCcw,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ProfileLink from "@/features/messages/components/ProfileLink";
import AcceptMessagesToggle from "@/features/messages/components/AcceptMessagesToggle";
import MessageCard from "@/features/messages/components/MessageCard";

import { useQuestion } from "@/features/questions/hooks/useQuestion";
import { ApiResponse } from "@/types/ApiResponse";
import {
  deleteQuestionById,
  updateQuestionAcceptingMessage,
} from "@/features/questions/services/questions.service";

export default function QuestionDashboardPage() {
  const { questionId } = useParams<{
    questionId: string;
  }>();
  const router = useRouter();

  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingAcceptance, setIsUpdatingAcceptance] = useState(false);

  const username = session?.user?.username ?? "";

  const {
    question,
    loading,
    fetchQuestion,
    deleteMessageLocally,
    setQuestionAcceptingMessage,
  } = useQuestion(questionId);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  const profileUrl = `${baseUrl}/u/${username}/question/${questionId}`;
  const isAcceptingResponses = question?.isAcceptingMessage ?? true;

  const handleDeleteQuestion = async () => {
    try {
      setIsDeleting(true);

      const response =
        await deleteQuestionById(
          questionId
        );

      toast.success(response.message);
      router.push("/dashboard/question");
      router.refresh();
    } catch (error) {
      const errorMessage =
        isAxiosError<ApiResponse>(error)
        ? error.response?.data.message
        : undefined;

      toast.error(errorMessage ?? "Failed to delete question");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAcceptance = async (checked: boolean) => {
    if (!question) {
      return;
    }

    const previousValue = question.isAcceptingMessage;

    try {
      setIsUpdatingAcceptance(true);
      setQuestionAcceptingMessage(checked);

      const response =
        await updateQuestionAcceptingMessage(
          questionId,
          checked
        );

      const nextValue =
        response.isAcceptingMessage ??
        checked;

      setQuestionAcceptingMessage(nextValue);
      toast.success(
        nextValue
          ? "Question is now accepting responses"
          : "Question responses are paused"
      );
    } catch (error) {
      setQuestionAcceptingMessage(previousValue);

      const errorMessage =
        isAxiosError<ApiResponse>(error)
        ? error.response?.data.message
        : undefined;

      toast.error(errorMessage ?? "Failed to update question settings");
    } finally {
      setIsUpdatingAcceptance(false);
    }
  };

  if (loading && !question) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading question
        </CardContent>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <MessageSquare className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-semibold">
            Question not found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            This question may have been removed or is no longer available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase text-muted-foreground">
            Question
          </p>

          <h1 className="mt-1 max-w-3xl text-3xl font-bold leading-tight">
            {question.content}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <p>
              {question.messages.length} {question.messages.length === 1 ? "response" : "responses"} received
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1">
              {isAcceptingResponses ? (
                <ShieldCheck className="h-4 w-4 text-primary" />
              ) : (
                <ShieldOff className="h-4 w-4" />
              )}
              {isAcceptingResponses ? "Accepting responses" : "Responses paused"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => fetchQuestion()}
            disabled={loading || isDeleting || isUpdatingAcceptance}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Question
                  </>
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete this question?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  This will permanently remove the question, its share link, and all anonymous responses attached to it.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDeleteQuestion}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete permanently"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>
              Share this question
            </CardTitle>

            <CardDescription>
              Send this link to collect responses for this prompt only.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ProfileLink
              profileUrl={profileUrl}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Response access
            </CardTitle>

            <CardDescription>
              Pause this prompt when you have enough answers.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AcceptMessagesToggle
              acceptMessages={isAcceptingResponses}
              loading={isUpdatingAcceptance}
              onToggle={handleToggleAcceptance}
              title="Accept responses"
              activeDescription="This question is live for new responses"
              inactiveDescription="This question is paused for new responses"
            />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Responses
          </h2>

          <p className="text-sm text-muted-foreground">
            Reply privately using the sender&apos;s saved access token.
          </p>
        </div>

        {question.messages.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <MessageSquare className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-semibold">
                No responses yet
              </h3>

              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Share this question link to start receiving anonymous responses.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
