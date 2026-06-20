import axios from "axios";
import {
  signIn,
} from "next-auth/react";
import * as z from "zod";

import { ApiResponse } from "@/types/ApiResponse";
import { signInSchema } from "@/features/auth/schemas/signInSchema";
import { signUpSchema } from "@/features/auth/schemas/signupSchema";
import { verifySchema } from "@/features/auth/schemas/verifySchema";

export const signInWithCredentials =
  async (
    data: z.infer<typeof signInSchema>,
  ) =>
    signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });

export const checkUsernameUnique =
  async (username: string) =>
    (
      await axios.get<ApiResponse>(
        `/api/check-username-unique?username=${username}`,
      )
    ).data;

export const signUpUser =
  async (
    data: z.infer<typeof signUpSchema>,
  ) =>
    (
      await axios.post<ApiResponse>(
        "/api/sign-up",
        data,
      )
    ).data;

export const verifyAccountCode =
  async ({
    username,
    code,
  }: {
    username: string;
    code: z.infer<typeof verifySchema>["code"];
  }) =>
    axios.post("/api/verify-code", {
      username,
      code,
    });
