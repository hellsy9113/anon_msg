'use client'

import { useState } from "react";
import { isAxiosError } from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

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
import {
  deleteMessageById,
  replyToMessageById,
} from "@/features/messages/services/messages.service";

import {
  Loader2,
  MessageCircle,
  Send,
  Trash2,
} from "lucide-react";

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
      const response =
        await deleteMessageById(
          message._id?.toString() as string
        );

      toast.success(response.message);

      onMessageDelete(message._id?.toString() as string);

    } catch (error) {
      const axiosErrorMessage =
        isAxiosError<ApiResponse>(error)
        ? error.response?.data.message
        : undefined;

      toast.error(
        axiosErrorMessage ??
          "Failed to delete message"
      );
    }
  };

  const handleReplySubmit = async () => {
    if (!reply.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const response =
        await replyToMessageById({
          messageId:
            message._id?.toString() as string,
          content: reply,
        });

      toast.success(response.message);

      setReply("");

    } catch (error) {
      const axiosErrorMessage =
        isAxiosError<ApiResponse>(error)
        ? error.response?.data.message
        : undefined;

      toast.error(
        axiosErrorMessage ??
          "Failed to send reply"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden border-l-4 border-l-primary/70">
      <CardHeader className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              Anonymous message
            </div>

            <CardTitle className="text-base leading-6">
              {message.content}
            </CardTitle>

            <CardDescription className="text-xs">
              {new Date(message.createdAt).toLocaleString()}
            </CardDescription>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
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

      <CardContent className="space-y-5 p-5 pt-0">
        {message.replies?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              Replies
            </h3>

            {message.replies.map((replyItem, index) => (
              <div
                key={index}
                className="rounded-md border bg-muted/30 p-3"
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

        <div className="space-y-3">
          <Textarea
            placeholder="Write a reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="min-h-24 resize-none bg-background"
          />

          <Button
            onClick={handleReplySubmit}
            disabled={loading || !reply.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Reply
              </>
            )}
          </Button>

        </div>

      </CardContent>
    </Card>
  );
};

export default MessageCard;
