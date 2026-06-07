"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import {
  RefreshCcw,
  Loader2,
  MessageSquare,
  Link2,
  ShieldCheck,
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
import AcceptMessagesToggle from "@/components/dashboard/AcceptMessagesToggle";
import MessageCard from "@/components/MessageCard";

import { useMessages } from "@/hooks/useMessages";
import { useAcceptMessages } from "@/hooks/useAcceptMessages";

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
    <div className="container mx-auto max-w-7xl px-4 py-8">

      {/* Welcome Banner */}

      <Card className="mb-8">
        <CardContent className="py-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back,
            {" "}
            {username}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your profile and incoming
            anonymous messages.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}

      <div className="mb-8 grid gap-4 md:grid-cols-3">

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <MessageSquare className="h-8 w-8" />

            <div>
              <div className="text-2xl font-bold">
                {messages.length}
              </div>

              <p className="text-sm text-muted-foreground">
                Total Messages
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Link2 className="h-8 w-8" />

            <div>
              <div className="text-2xl font-bold">
                Active
              </div>

              <p className="text-sm text-muted-foreground">
                Public Profile
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <ShieldCheck className="h-8 w-8" />

            <div>
              <div className="text-2xl font-bold">
                {acceptMessages
                  ? "ON"
                  : "OFF"}
              </div>

              <p className="text-sm text-muted-foreground">
                Message Status
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Profile + Settings */}

      <div className="mb-8 grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">

          <Card>
            <CardHeader>
              <CardTitle>
                Public Profile
              </CardTitle>

              <CardDescription>
                Share this link to receive
                anonymous messages.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ProfileLink
                profileUrl={profileUrl}
              />
            </CardContent>
          </Card>

        </div>

        <div>

          <Card>
            <CardHeader>
              <CardTitle>
                Settings
              </CardTitle>

              <CardDescription>
                Control whether people can
                send you messages.
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

      </div>

      {/* Messages Section */}

      <div className="mb-4 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-semibold">
            Messages
          </h2>

          <p className="text-muted-foreground">
            View and manage received
            messages.
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

      <Separator className="mb-6" />

      {/* Messages Grid */}

      {messages.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
          <CardContent className="flex flex-col items-center justify-center py-12">

            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />

            <h3 className="text-lg font-semibold">
              No messages yet
            </h3>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Share your profile link to
              start receiving anonymous
              messages.
            </p>

          </CardContent>
        </Card>
      )}

    </div>
  );
}