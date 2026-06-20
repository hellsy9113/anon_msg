"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import {
  Link2,
  Loader2,
  MessageSquare,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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

import { useMessages } from "@/features/messages/hooks/useMessages";
import { useAcceptMessages } from "@/features/messages/hooks/useAcceptMessages";

export default function DashboardPage() {
  const { data: session } = useSession();

  const {
    messages,
    loading: isMessagesLoading,
    fetchMessages,
    deleteMessageLocally,
  } = useMessages();

  const {
    acceptMessages,
    loading: isSwitchLoading,
    fetchAcceptMessages,
    updateAcceptMessages,
  } = useAcceptMessages();

  const username =
    session?.user?.username || "";

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  const profileUrl =
    `${baseUrl}/u/${username}`;

  useEffect(() => {
    fetchMessages();
    fetchAcceptMessages();
  }, [
    fetchMessages,
    fetchAcceptMessages,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase text-muted-foreground">
            Inbox
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Anonymous messages
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Share your profile link, review incoming messages, and reply without exposing the sender.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            fetchMessages(true)
          }
          disabled={isMessagesLoading}
        >
          {isMessagesLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>

            <div>
              <div className="text-2xl font-bold">
                {messages.length}
              </div>

              <p className="text-sm text-muted-foreground">
                Total messages
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Link2 className="h-5 w-5" />
            </div>

            <div>
              <div className="text-2xl font-bold">
                Active
              </div>

              <p className="text-sm text-muted-foreground">
                Public profile
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <div className="text-2xl font-bold">
                {acceptMessages
                  ? "Open"
                  : "Paused"}
              </div>

              <p className="text-sm text-muted-foreground">
                Message status
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>
              Public profile link
            </CardTitle>

            <CardDescription>
              Anyone with this link can send one anonymous message.
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
              Inbox access
            </CardTitle>

            <CardDescription>
              Pause new messages when you need quiet time.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AcceptMessagesToggle
              acceptMessages={
                acceptMessages
              }
              loading={
                isSwitchLoading
              }
              onToggle={
                updateAcceptMessages
              }
            />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Message queue
          </h2>

          <p className="text-sm text-muted-foreground">
            Newest messages appear first.
          </p>
        </div>

        {isMessagesLoading && messages.length === 0 ? (
          <Card>
            <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading messages
            </CardContent>
          </Card>
        ) : messages.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {messages.map((message) => (
              <MessageCard
                key={message._id?.toString()}
                message={message}
                onMessageDelete={
                  deleteMessageLocally
                }
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
                No messages yet
              </h3>

              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Share your public profile link to start receiving anonymous messages.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
