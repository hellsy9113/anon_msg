"use client";

import { useRouter } from "next/navigation";
import { Question } from "@/features/questions/types/question";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { ArrowUpRight, MessageSquare, ShieldCheck, ShieldOff } from "lucide-react";

export default function QuestionCard({
  question,
}: {
  question: Question;
}) {
  const router = useRouter();

  return (
    <Card
      className="group cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      onClick={() =>
        router.push(
          `/dashboard/question/${question._id}`
        )
      }
    >
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <h3 className="text-base font-semibold leading-6">
              {question.content}
            </h3>

            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {question.isAcceptingMessage ? (
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              ) : (
                <ShieldOff className="h-3.5 w-3.5" />
              )}
              {question.isAcceptingMessage ? "Accepting responses" : "Responses paused"}
            </div>
          </div>

          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          {question.totalMessages} {question.totalMessages === 1 ? "response" : "responses"}
        </div>
      </CardContent>
    </Card>
  );
}
