import { useCallback, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

import { Message } from "@/modal/user";
import { ApiResponse } from "@/types/ApiResponse";

export function useMessages() {
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  const fetchMessages = useCallback(
    async (refresh = false) => {
      try {
        setLoading(true);

        const response =
          await axios.get<ApiResponse>(
            "/api/get-messages"
          );

        setMessages(
          response.data.messages || []
        );

        if (refresh) {
          toast.success(
            "Showing latest message"
          );
        }
      } catch (error) {
        const axiosError =
          error as AxiosError<ApiResponse>;

        toast.error(
          axiosError.response?.data.message ??
            "Failed to fetch message"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteMessageLocally = (
    messageId: string
  ) => {
    setMessages((prev) =>
      prev.filter(
        (message) =>
          message._id?.toString() !==
          messageId
      )
    );
  };

  return {
    messages,
    loading,
    fetchMessages,
    deleteMessageLocally,
  };
}