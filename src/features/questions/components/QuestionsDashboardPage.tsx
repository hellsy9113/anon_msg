"use client";

import { useEffect, useState } from "react";

import {
  Loader2,
  MessageSquarePlus,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import QuestionCard from "@/features/questions/components/QuestionCard";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAskQuestion } from "@/features/questions/hooks/useAskQuestion";
import { useQuestions} from "@/features/questions/hooks/useQuestion";

export default function QuestionsPage() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");

  const {
    questions,
    loading: questionsLoading,
    fetchQuestions,
  } = useQuestions();

  const {
    askQuestion,
    loading: askLoading,
  } = useAskQuestion();

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSave = async () => {
    const success = await askQuestion(question);

    if (success) {
      setQuestion("");
      setOpen(false);

      await fetchQuestions();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase text-muted-foreground">
            Prompts
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Questions
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Create focused prompts and share each one as a separate anonymous response link.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {questionsLoading && questions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading questions
          </CardContent>
        </Card>
      ) : questions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {questions.map((q) => (
            <QuestionCard
              key={q._id?.toString()}
              question={q}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <MessageSquarePlus className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold">
              No questions yet
            </h3>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Add a prompt to collect focused anonymous responses.
            </p>

            <Button
              className="mt-5"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Question
            </DialogTitle>
          </DialogHeader>

          <Textarea
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            placeholder="What would you like people to answer?"
            className="min-h-28 resize-none"
          />

          <Button
            onClick={handleSave}
            disabled={
              askLoading ||
              !question.trim()
            }
          >
            {askLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save Question"
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
