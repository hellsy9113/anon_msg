import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

import { ApiResponse } from "@/types/ApiResponse";

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
          await axios.get<ApiResponse>(
            "/api/accept-message"
          );

        setAcceptMessages(
          response.data.isAcceptingMessage ??
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
          await axios.post<ApiResponse>(
            "/api/accept-message",
            {
              acceptMessages: checked,
            }
          );

        setAcceptMessages(checked);

        toast.success(
          response.data.message
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