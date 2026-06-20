import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { ApiResponse } from "@/types/ApiResponse";
import {
  fetchAcceptMessagesStatus,
  updateAcceptMessagesStatus,
} from "@/features/messages/services/messages.service";

export function useAcceptMessages() {
  const [acceptMessages, setAcceptMessages] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const fetchAcceptMessages =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await fetchAcceptMessagesStatus();

        setAcceptMessages(
          response.isAcceptingMessage ??
            true
        );
      } catch (error) {
        const axiosError =
          error as AxiosError<ApiResponse>;

        toast.error(
          axiosError.response?.data.message ??
            "Failed to fetch settings"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  const updateAcceptMessages =
    async (checked: boolean) => {
      try {
        setLoading(true);

        const response =
          await updateAcceptMessagesStatus(
            checked
          );

        setAcceptMessages(checked);

        toast.success(
          response.message
        );
      } catch (error) {
        const axiosError =
          error as AxiosError<ApiResponse>;

        toast.error(
          axiosError.response?.data.message ??
            "Failed to update settings"
        );
      } finally {
        setLoading(false);
      }
    };

  return {
    acceptMessages,
    loading,
    fetchAcceptMessages,
    updateAcceptMessages,
  };
}
