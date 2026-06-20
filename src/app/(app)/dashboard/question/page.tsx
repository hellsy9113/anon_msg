"use client";

import { useEffect, useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import QuestionCard from "@/components//questions/QuestionCard";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAskQuestion } from "@/hooks/question/useAskQuestion";
import { useQuestions} from "@/hooks/question/useQuestion";

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Questions
          </h1>

          <p className="text-muted-foreground">
            Manage your questions.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
  {questions.map((q) => (
    <QuestionCard
      key={q._id?.toString()}
      question={q}
    />
  ))}
</div>
    

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
            placeholder="Write your question..."
          />

          <Button
            onClick={handleSave}
            disabled={
              askLoading ||
              !question.trim()
            }
          >
            Save Question
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}