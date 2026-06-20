"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
}

export default function CreateQuestionDialog({
  open,
  onOpenChange,
}: Props) {
  const [question, setQuestion] =
    useState("");

  const handleSave = () => {
    console.log(question);

    setQuestion("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
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
          disabled={!question.trim()}
        >
          Save Question
        </Button>

      </DialogContent>
    </Dialog>
  );
}