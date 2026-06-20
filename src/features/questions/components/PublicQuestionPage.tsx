"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Send,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  getLatestScopedReplyTokenRecord,
  getScopedReplyTokenRecords,
  migrateLegacyQuestionReplyToken,
  setLegacyQuestionReplyToken,
  upsertReplyTokenRecord,
} from "@/features/messages/utils/replyTokenStorage";
import { messageSchema } from "@/features/messages/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import {
  MessageData,
  ReplyConversation,
  ReplyTokenRecord,
} from "@/features/messages/types/replyAccess";
import {
  fetchReplyMessageData,
  sendAnonymousMessage,
} from "@/features/messages/services/messages.service";
import {
  sortConversations,
  upsertConversation,
} from "@/features/messages/utils/replyConversation";
import {
  fetchPublicQuestionById,
} from "@/features/questions/services/questions.service";
import {
  PublicQuestion,
} from "@/features/questions/types/question";
import PaginationControls from "@/features/messages/components/PaginationControls";

const FEATURE = "question" as const;
const HISTORY_PAGE_SIZE = 4;
const REPLIES_PAGE_SIZE = 5;

export default function PublicQuestionPage() {
  const { username, questionId } = useParams<{
    username: string;
    questionId: string;
  }>();

  const [question, setQuestion] =
    useState<PublicQuestion | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [sending, setSending] =
    useState(false);
  const [fetchingReplies, setFetchingReplies] =
    useState(false);
  const [loadingHistory, setLoadingHistory] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [replyToken, setReplyToken] =
    useState("");
  const [savedToken, setSavedToken] =
    useState("");
  const [copiedToken, setCopiedToken] =
    useState("");
  const [conversationHistory, setConversationHistory] =
    useState<ReplyConversation[]>([]);
  const [historyPage, setHistoryPage] =
    useState(1);
  const [replyPage, setReplyPage] =
    useState(1);

  const currentConversation =
    conversationHistory.find(
      (conversation) =>
        conversation.token === replyToken,
    ) ?? null;

  const historyTotalPages = Math.max(
    1,
    Math.ceil(
      conversationHistory.length /
        HISTORY_PAGE_SIZE,
    ),
  );

  const currentHistoryPage = Math.min(
    historyPage,
    historyTotalPages,
  );

  const visibleConversationHistory =
    conversationHistory.slice(
      (currentHistoryPage - 1) *
        HISTORY_PAGE_SIZE,
      currentHistoryPage *
        HISTORY_PAGE_SIZE,
    );

  const replies =
    currentConversation?.messageData.replies ??
    [];

  const replyTotalPages = Math.max(
    1,
    Math.ceil(
      replies.length / REPLIES_PAGE_SIZE,
    ),
  );

  const currentReplyPage = Math.min(
    replyPage,
    replyTotalPages,
  );

  const visibleReplies = replies.slice(
    (currentReplyPage - 1) *
      REPLIES_PAGE_SIZE,
    currentReplyPage * REPLIES_PAGE_SIZE,
  );

  const fetchMessageData = async (
    token: string,
    options: {
      silent?: boolean;
    } = {},
  ) => {
    try {
      const response =
        await fetchReplyMessageData(
          token,
        );

      return response.messageData ?? null;
    } catch (error) {
      if (!options.silent) {
        const errorMessage =
          isAxiosError<ApiResponse>(error)
            ? error.response?.data.message
            : undefined;

        toast.error(
          errorMessage ??
            "Failed to fetch replies.",
        );
      }

      return null;
    }
  };

  const saveConversation = (
    tokenRecord: ReplyTokenRecord,
    messageData: MessageData,
  ) => {
    const nextRecords =
      upsertReplyTokenRecord({
        ...tokenRecord,
        originalMessage:
          messageData.originalMessage,
      });

    const storedRecord =
      nextRecords.find(
        (record) =>
          record.token === tokenRecord.token,
      ) ?? {
        ...tokenRecord,
        originalMessage:
          messageData.originalMessage,
      };

    const nextConversation: ReplyConversation =
      {
        ...storedRecord,
        messageData,
      };

    setConversationHistory((previous) =>
      upsertConversation(
        previous,
        nextConversation,
      ),
    );
  };

  const selectConversation = (
    token: string,
  ) => {
    setReplyToken(token);
    setSavedToken(token);
    setReplyPage(1);
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response =
          await fetchPublicQuestionById(
            username,
            questionId,
          );

        setQuestion(response.question);
      } catch (error) {
        const errorMessage =
          isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data?.message
            : undefined;

        toast.error(
          errorMessage ??
            "Unable to load question.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (username && questionId) {
      void fetchQuestion();
    }
  }, [questionId, username]);

  useEffect(() => {
    if (!username || !questionId) {
      return;
    }

    let cancelled = false;

    const loadStoredConversations =
      async () => {
        migrateLegacyQuestionReplyToken({
          username,
          questionId,
        });

        const latestStoredRecord =
          getLatestScopedReplyTokenRecord({
            username,
            feature: FEATURE,
            questionId,
          });

        const storedRecords =
          getScopedReplyTokenRecords({
            username,
            feature: FEATURE,
            questionId,
          });

        if (cancelled) {
          return;
        }

        setConversationHistory([]);
        setReplyToken(
          latestStoredRecord?.token ?? "",
        );
        setSavedToken(
          latestStoredRecord?.token ?? "",
        );

        if (storedRecords.length === 0) {
          setLoadingHistory(false);
          setConversationHistory([]);
          return;
        }

        setLoadingHistory(true);

        try {
          const loadedConversations: Array<
            ReplyConversation | null
          > =
            await Promise.all(
              storedRecords.map(
                async (
                  record,
                ): Promise<
                  ReplyConversation | null
                > => {
                  const messageData =
                    await fetchMessageData(
                      record.token,
                      {
                        silent: true,
                      },
                    );

                  if (!messageData) {
                    return null;
                  }

                  return {
                    ...record,
                    originalMessage:
                      messageData.originalMessage,
                    messageData,
                  };
                },
              ),
            );

          if (cancelled) {
            return;
          }

          const validConversations =
            loadedConversations.filter(
              (
                conversation,
              ): conversation is ReplyConversation =>
                conversation !== null,
            );

          setConversationHistory(
            sortConversations(
              validConversations,
            ),
          );

          if (
            validConversations.length > 0 &&
            !validConversations.some(
              (conversation) =>
                conversation.token ===
                latestStoredRecord?.token,
            )
          ) {
            setReplyToken(
              validConversations[0].token,
            );
            setSavedToken(
              validConversations[0].token,
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingHistory(false);
          }
        }
      };

    void loadStoredConversations();

    return () => {
      cancelled = true;
    };
  }, [questionId, username]);

  const handleSend = async () => {
    const validationResult =
      messageSchema.safeParse({
        content: message,
      });

    if (!validationResult.success) {
      toast.error(
        validationResult.error.issues[0]
          ?.message ??
          "Please enter a valid message.",
      );
      return;
    }

    try {
      setSending(true);

      const response =
        await sendAnonymousMessage({
          username,
          questionId,
          content:
            validationResult.data.content,
        });

      const token =
        response.replyAccessToken;

      if (!token) {
        throw new Error(
          "Reply access token missing from response",
        );
      }

      const fallbackMessageData: MessageData =
        {
          originalMessage:
            validationResult.data.content,
          createdAt:
            new Date().toISOString(),
          replies: [],
        };

      const fetchedMessageData =
        await fetchMessageData(token, {
          silent: true,
        });

      const messageData =
        fetchedMessageData ??
        fallbackMessageData;

      saveConversation(
        {
          token,
          username,
          feature: FEATURE,
          questionId,
          originalMessage:
            validationResult.data.content,
          savedAt:
            new Date().toISOString(),
        },
        messageData,
      );

      setHistoryPage(1);
      setLegacyQuestionReplyToken({
        questionId,
        token,
      });
      selectConversation(token);
      setMessage("");

      toast.success(response.message);
    } catch (error) {
      const errorMessage =
        isAxiosError<{
          message?: string;
        }>(error)
          ? error.response?.data?.message
          : undefined;

      toast.error(
        errorMessage ??
          "Failed to send message.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async (
    token: string,
  ) => {
    if (!token) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        token,
      );

      setCopiedToken(token);
      toast.success("Reply token copied.");

      setTimeout(() => {
        setCopiedToken((current) =>
          current === token ? "" : current,
        );
      }, 2000);
    } catch {
      toast.error("Failed to copy token.");
    }
  };

  const handleViewReplies = async () => {
    const token = savedToken.trim();

    if (!token) {
      toast.error(
        "Enter your reply token.",
      );
      return;
    }

    try {
      setFetchingReplies(true);

      const messageData =
        await fetchMessageData(token);

      if (!messageData) {
        return;
      }

      saveConversation(
        {
          token,
          username,
          feature: FEATURE,
          questionId,
          savedAt:
            new Date().toISOString(),
        },
        messageData,
      );

      setHistoryPage(1);
      setLegacyQuestionReplyToken({
        questionId,
        token,
      });
      selectConversation(token);

      toast.success("Replies loaded.");
    } finally {
      setFetchingReplies(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading question
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <MessageSquare className="h-6 w-6" />
            </div>

            <h1 className="text-xl font-semibold">
              Question not found
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This question may have been
              removed or is no longer
              available.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl space-y-6 px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              @{username} asked--
            </h1>
          </div>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <p className="text-lg font-semibold leading-8">
                {question.content}
              </p>
            </CardContent>
          </Card>

          {!question.isAcceptingMessage && (
            <Card className="border-amber-200 bg-amber-50/80">
              <CardContent className="p-5 text-sm text-amber-900">
                @{username} has paused
                responses for this question
                right now. You can still keep
                your reply token and check
                past replies, but new answers
                are closed for the moment.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                Your response
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Textarea
                rows={8}
                placeholder="Write your anonymous response and be respectful..."
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value,
                  )
                }
                className="min-h-40 resize-none bg-background"
                disabled={
                  !question.isAcceptingMessage
                }
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {message.trim().length}/300
                  characters
                </p>

                <Button
                  onClick={handleSend}
                  disabled={
                    sending ||
                    !message.trim() ||
                    !question.isAcceptingMessage
                  }
                  className="sm:w-44"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Response
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          {replyToken && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Current reply token
                </CardTitle>

                <CardDescription>
                  Keep this token to check for
                  replies later.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={replyToken}
                    className="font-mono text-xs"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      handleCopy(replyToken)
                    }
                  >
                    {copiedToken ===
                    replyToken ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RefreshCcw className="h-5 w-5 text-primary" />
                View replies
              </CardTitle>

              <CardDescription>
                Paste your token to check
                whether @{username}
                responded.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                placeholder="Paste your reply token..."
                value={savedToken}
                onChange={(event) =>
                  setSavedToken(
                    event.target.value,
                  )
                }
              />

              <Button
                className="w-full"
                onClick={handleViewReplies}
                disabled={
                  fetchingReplies ||
                  !savedToken.trim()
                }
              >
                {fetchingReplies ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    View Replies
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              Saved responses
            </CardTitle>

            <CardDescription>
              Stored on this device and
              restored automatically for
              this question.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-4">
            {loadingHistory ? (
              <div className="space-y-3">
                <div className="h-18 animate-pulse rounded-lg bg-muted/30" />
                <div className="h-18 animate-pulse rounded-lg bg-muted/30" />
              </div>
            ) : conversationHistory.length >
              0 ? (
              <div className="flex flex-1 flex-col gap-4">
                <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                  {visibleConversationHistory.map(
                (conversation) => (
                  <div
                    key={conversation.token}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      selectConversation(
                        conversation.token,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key !== "Enter" &&
                        event.key !== " "
                      ) {
                        return;
                      }

                      event.preventDefault();
                      selectConversation(
                        conversation.token,
                      );
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      conversation.token ===
                      replyToken
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/30 hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-mono text-xs">
                            {
                              conversation.token
                            }
                          </p>

                          {conversation.token ===
                            replyToken && (
                            <span className="text-[10px] font-medium uppercase text-primary">
                              Current
                            </span>
                          )}
                        </div>

                        <p className="text-sm leading-6">
                          {
                            conversation
                              .messageData
                              .originalMessage
                          }
                        </p>

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>
                            {new Date(
                              conversation
                                .messageData
                                .createdAt,
                            ).toLocaleString()}
                          </span>
                          <span>
                            {
                              conversation
                                .messageData
                                .replies.length
                            }{" "}
                            replies
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        onClick={(
                          event,
                        ) => {
                          event.stopPropagation();
                          void handleCopy(
                            conversation.token,
                          );
                        }}
                      >
                        {copiedToken ===
                        conversation.token ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ),
              )}
                </div>

                <PaginationControls
                  currentPage={currentHistoryPage}
                  totalPages={historyTotalPages}
                  onPageChange={setHistoryPage}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Saved responses will appear
                here after you send an
                answer or load a token.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-lg">
                Conversation
              </CardTitle>

              <CardDescription>
                Loaded from your saved
                reply-token history for this
                question.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              {currentConversation ? (
                <>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Your response
                    </p>

                    <p className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm leading-6">
                      {
                        currentConversation
                          .messageData
                          .originalMessage
                      }
                    </p>
                  </div>

                  <Separator />

                  <p className="text-xs font-medium text-muted-foreground">
                    @{username} reply
                  </p>

                  {replies.length > 0 ? (
                    <div className="flex flex-1 flex-col gap-4">
                      <div className="max-h-[24rem] space-y-3 overflow-y-auto pr-1">
                        {visibleReplies.map(
                          (
                            reply,
                            index,
                          ) => (
                            <div
                              key={`${reply.createdAt}-${index}`}
                              className="rounded-lg border p-3"
                            >
                              <p className="text-sm leading-6">
                                {reply.content}
                              </p>

                              <p className="mt-2 text-xs text-muted-foreground">
                                {new Date(
                                  reply.createdAt,
                                ).toLocaleString()}
                              </p>
                            </div>
                          ),
                        )}
                      </div>

                      <PaginationControls
                        currentPage={currentReplyPage}
                        totalPages={replyTotalPages}
                        onPageChange={setReplyPage}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No replies yet.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a saved response to
                  review replies here.
                </p>
              )}
            </CardContent>
          </Card>
      </div>
    </main>
  );
}
