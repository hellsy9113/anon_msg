import axios from "axios";

import { ApiResponse } from "@/types/ApiResponse";

export const fetchInboxMessages =
  async () =>
    (
      await axios.get<ApiResponse>(
        "/api/get-messages",
      )
    ).data;

export const fetchAcceptMessagesStatus =
  async () =>
    (
      await axios.get<ApiResponse>(
        "/api/accept-message",
      )
    ).data;

export const updateAcceptMessagesStatus =
  async (checked: boolean) =>
    (
      await axios.post<ApiResponse>(
        "/api/accept-message",
        {
          acceptMessages: checked,
        },
      )
    ).data;

export const fetchReplyMessageData =
  async (replyAccessToken: string) =>
    (
      await axios.post<ApiResponse>(
        "/api/get-replies",
        {
          replyAccessToken,
        },
      )
    ).data;

export const sendAnonymousMessage =
  async ({
    username,
    content,
    questionId,
  }: {
    username: string;
    content: string;
    questionId?: string;
  }) =>
    (
      await axios.post<ApiResponse>(
        "/api/send-message",
        {
          username,
          content,
          questionId,
        },
      )
    ).data;

export const deleteMessageById =
  async (messageId: string) =>
    (
      await axios.delete<ApiResponse>(
        `/api/delete-message/${messageId}`,
      )
    ).data;

export const replyToMessageById =
  async ({
    messageId,
    content,
  }: {
    messageId: string;
    content: string;
  }) =>
    (
      await axios.post<ApiResponse>(
        `/api/reply-message/${messageId}`,
        {
          content,
        },
      )
    ).data;
