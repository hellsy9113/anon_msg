import axios from "axios";

import { ApiResponse } from "@/types/ApiResponse";
import { Question } from "@/features/questions/types/question";

interface QuestionResponse {
  success: boolean;
  question: Question;
}

interface QuestionsResponse {
  questions?: Question[];
}

interface PublicQuestionResponse {
  question: Question;
}

export const fetchQuestionsList =
  async () =>
    (
      await axios.get<QuestionsResponse>(
        "/api/fetch-questions",
      )
    ).data;

export const createQuestion =
  async (content: string) =>
    (
      await axios.post<ApiResponse>(
        "/api/ask-question",
        {
          content,
        },
      )
    ).data;

export const fetchQuestionById =
  async (questionId: string) =>
    (
      await axios.get<QuestionResponse>(
        `/api/question/${questionId}`,
      )
    ).data;

export const fetchPublicQuestionById =
  async (
    username: string,
    questionId: string,
  ) =>
    (
      await axios.get<PublicQuestionResponse>(
        `/api/public-question/${username}/${questionId}`,
      )
    ).data;

export const deleteQuestionById =
  async (questionId: string) =>
    (
      await axios.delete<ApiResponse>(
        `/api/question/${questionId}/delete`,
      )
    ).data;

export const updateQuestionAcceptingMessage =
  async (
    questionId: string,
    checked: boolean,
  ) =>
    (
      await axios.post<ApiResponse>(
        `/api/question/${questionId}/accept-message`,
        {
          acceptMessages: checked,
        },
      )
    ).data;
