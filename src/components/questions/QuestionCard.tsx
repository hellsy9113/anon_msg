"use client";

import { useRouter } from "next/navigation";
import { Question } from "@/types/Question";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { MessageSquare } from "lucide-react";

export default function QuestionCard({
  question,
}: {
  question: Question;
}) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition hover:shadow-md"
      onClick={() =>
        router.push(
          `/dashboard/question/${question._id}`
        )
      }
    >
      <CardContent className="pt-6">
        <h3 className="font-medium">
          {question.content}
        </h3>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          {question.totalMessages} message
        </div>
      </CardContent>
    </Card>
  );
}