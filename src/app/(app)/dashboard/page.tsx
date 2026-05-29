"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios, { AxiosError } from "axios";

import { useSession } from "next-auth/react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2, RefreshCcw } from "lucide-react";

import { toast } from "sonner";

import MessageCard from "@/components/MessageCard";

import { Message } from "@/modal/user";

import { ApiResponse } from "@/types/ApiResponse";

import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";

import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";

import { Switch } from "@/components/ui/switch";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";

import { useRouter } from "next/navigation";

export default function UserDashboard() {

   const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);

  const [isMessagesLoading, setIsMessagesLoading] =
    useState(false);

  const [isSwitchLoading, setIsSwitchLoading] =
    useState(false);

  const { data: session, status } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessages: true,
    },
  });

  const acceptMessages =
    form.watch("acceptMessages");

  const username = session?.user?.username || "";

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  const profileUrl = `${baseUrl}/u/${username}`;

  // Fetch accept message settings
  const fetchAcceptMessages = useCallback(async () => {
    try {
      setIsSwitchLoading(true);

      const response =
        await axios.get<ApiResponse>(
          "/api/accept-messages"
        );

      form.setValue(
        "acceptMessages",
        response.data.isAcceptingMessage ?? true
      );

    } catch (error) {
      const axiosError =
        error as AxiosError<ApiResponse>;

      toast.error(
        axiosError.response?.data.message ||
          "Failed to fetch message settings"
      );

    } finally {
      setIsSwitchLoading(false);
    }
  }, [form]);

  // Fetch messages
  const fetchMessages = useCallback(
    async (refresh = false) => {
      try {
        setIsMessagesLoading(true);

        const response =
          await axios.get<ApiResponse>(
            "/api/get-messages"
          );

        setMessages(response.data.messages || []);

        if (refresh) {
          toast.success(
            "Showing latest messages"
          );
        }

      } catch (error) {
        const axiosError =
          error as AxiosError<ApiResponse>;

        toast.error(
          axiosError.response?.data.message ||
            "Failed to fetch messages"
        );

      } finally {
        setIsMessagesLoading(false);
      }
    },
    []
  );

  // Load dashboard data
  useEffect(() => {
    if (status !== "authenticated") return;

    fetchMessages();

    fetchAcceptMessages();

  }, [
    status,
    fetchMessages,
    fetchAcceptMessages,
  ]);

  // Toggle accept messages
  const handleSwitchChange = async (
    checked: boolean
  ) => {
    try {
      setIsSwitchLoading(true);

      const response =
        await axios.post<ApiResponse>(
          "/api/accept-messages",
          {
            acceptMessages: checked,
          }
        );

      form.setValue(
        "acceptMessages",
        checked
      );

      toast.success(response.data.message);

    } catch (error) {
      const axiosError =
        error as AxiosError<ApiResponse>;

      toast.error(
        axiosError.response?.data.message ||
          "Failed to update settings"
      );

    } finally {
      setIsSwitchLoading(false);
    }
  };

  useEffect(()=>{
    if(status=== "unauthenticated")
    {
      router.replace("/");
    }
  },[status,router]);


if (status === "loading") {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

if (status === "unauthenticated") {
  return null;
}

  // Delete message from UI
  const handleDeleteMessage = (
    messageId: string
  ) => {
    setMessages((prevMessages) =>
      prevMessages.filter(
        (message) =>
          message._id?.toString() !== messageId
      )
    );
  };

  // Copy profile URL
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        profileUrl
      );

      toast.success("Profile URL copied");

    } catch {
      toast.error("Failed to copy URL");
    }
  };


  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto max-w-6xl rounded-xl border bg-background p-6 shadow-sm">
      
      <h1 className="mb-6 text-4xl font-bold tracking-tight">
        User Dashboard
      </h1>

      {/* Profile URL */}
      <div className="mb-6 space-y-2">
        <h2 className="text-lg font-semibold">
          Your Public Profile Link
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />

          <Button onClick={copyToClipboard}>
            Copy
          </Button>
        </div>
      </div>

      {/* Accept messages */}
      <Form {...form}>
        <FormField
          control={form.control}
          name="acceptMessages"
          render={() => (
            <FormItem className="flex items-center gap-4">
              <FormControl>
                <Switch
                  checked={
                    acceptMessages || false
                  }
                  onCheckedChange={
                    handleSwitchChange
                  }
                  disabled={
                    isSwitchLoading
                  }
                />
              </FormControl>

              <span className="text-sm font-medium">
                Accept Messages:{" "}
                {acceptMessages
                  ? "On"
                  : "Off"}
              </span>
            </FormItem>
          )}
        />
      </Form>

      <Separator className="my-6" />

      {/* Refresh button */}
      <Button
        variant="outline"
        className="mb-6"
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
            Refresh Messages
          </>
        )}
      </Button>

      {/* Messages */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id?.toString()}
              message={message}
              onMessageDelete={
                handleDeleteMessage
              }
            />
          ))
        ) : (
          <p className="text-muted-foreground">
            No messages to display.
          </p>
        )}
      </div>
    </div>
  );
}