'use client'

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

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

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Message } from "@/modal/user";
import { ApiResponse } from "@/types/ApiResponse";

import axios from "axios";

import { X } from "lucide-react";

import { toast } from "sonner";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({
  message,
  onMessageDelete,
}: MessageCardProps) => {

  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id?.toString()}`
      );

      toast.success(response.data.message);

      onMessageDelete(message._id?.toString() as string);

    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleReplySubmit = async () => {
    if (!reply.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post<ApiResponse>(
        `/api/reply-message/${message._id?.toString()}`,
        {
          content: reply,
        }
      );

      toast.success(response.data.message);

      setReply("");

    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">

        <div className="flex items-start justify-between gap-4">

          <div className="space-y-2">
            <CardTitle className="text-lg">
              {message.content}
            </CardTitle>

            <CardDescription>
              {new Date(message.createdAt).toLocaleString()}
            </CardDescription>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you absolutely sure?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  This action cannot be undone.
                  This will permanently delete this feedback.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Existing Replies */}

        {message.replies?.length > 0 && (
          <div className="space-y-3">

            <h3 className="font-semibold">
              Replies
            </h3>

            {message.replies.map((replyItem, index) => (
              <div
                key={index}
                className="rounded-lg border p-3"
              >
                <p className="text-sm">
                  {replyItem.content}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(
                    replyItem.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reply Input */}

        <div className="space-y-3">

          <Textarea
            placeholder="Write a reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />

          <Button
            onClick={handleReplySubmit}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reply"}
          </Button>

        </div>

      </CardContent>
    </Card>
  );
};

export default MessageCard;