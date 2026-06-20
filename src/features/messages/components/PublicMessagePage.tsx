"use client";

import { useEffect, useState } from "react";
import {
  AxiosError,
  isAxiosError,
} from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Send,
} from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  getLatestScopedReplyTokenRecord,
  getScopedReplyTokenRecords,
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
import PaginationControls from "@/features/messages/components/PaginationControls";
import {
  sortConversations,
  upsertConversation,
} from "@/features/messages/utils/replyConversation";
import { toast } from "sonner";

const FEATURE = "default" as const;
const HISTORY_PAGE_SIZE = 4;
const REPLIES_PAGE_SIZE = 5;

export default function SendMessage() {
  const params = useParams<{
    username: string;
  }>();

  const username = params.username;

  const [mounted, setMounted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] =
    useState(false);
  const [isLoadingHistory, setIsLoadingHistory] =
    useState(false);
  const [replyAccessToken, setReplyAccessToken] =
    useState("");
  const [manualToken, setManualToken] =
    useState("");
  const [copiedToken, setCopiedToken] =
    useState("");
  const [conversationHistory, setConversationHistory] =
    useState<ReplyConversation[]>([]);
  const [historyPage, setHistoryPage] =
    useState(1);
  const [replyPage, setReplyPage] =
    useState(1);

  const form = useForm<
    z.infer<typeof messageSchema>
  >({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const messageContent = useWatch({
    control: form.control,
    name: "content",
  }) || "";

  const currentConversation =
    conversationHistory.find(
      (conversation) =>
        conversation.token === replyAccessToken,
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
          token
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
            "Failed to fetch replies",
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
    setReplyAccessToken(token);
    setManualToken(token);
    setReplyPage(1);
  };

  useEffect(() => {
    if (!username) {
      return;
    }

    let cancelled = false;

    const hydrateStoredConversations =
      async () => {
        const latestStoredRecord =
          getLatestScopedReplyTokenRecord({
            username,
            feature: FEATURE,
          });

        const storedRecords =
          getScopedReplyTokenRecords({
            username,
            feature: FEATURE,
          });

        if (cancelled) {
          return;
        }

        setConversationHistory([]);
        setReplyAccessToken(
          latestStoredRecord?.token ?? "",
        );
        setManualToken(
          latestStoredRecord?.token ?? "",
        );
        setMounted(true);

        if (storedRecords.length === 0) {
          setIsLoadingHistory(false);
          setConversationHistory([]);
          return;
        }

        setIsLoadingHistory(true);

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
            setReplyAccessToken(
              validConversations[0].token,
            );
            setManualToken(
              validConversations[0].token,
            );
          }
        } finally {
          if (!cancelled) {
            setIsLoadingHistory(false);
          }
        }
      };

    void hydrateStoredConversations();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleManualTokenFetch =
    async () => {
      const token = manualToken.trim();

      if (!token) {
        toast.error("Please enter a token");
        return;
      }

      setIsLoadingReplies(true);

      try {
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
            savedAt:
              new Date().toISOString(),
          },
          messageData,
        );

        setHistoryPage(1);
        selectConversation(token);
      } finally {
        setIsLoadingReplies(false);
      }
    };

  const handleCopyToken = async (
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
      toast.success(
        "Token copied to clipboard",
      );

      setTimeout(() => {
        setCopiedToken((current) =>
          current === token ? "" : current,
        );
      }, 2000);
    } catch {
      toast.error("Failed to copy token");
    }
  };

  const onSubmit = async (
    data: z.infer<typeof messageSchema>,
  ) => {
    setIsSending(true);

    try {
      const response =
        await sendAnonymousMessage({
          ...data,
          username,
        });

      toast.success(response.message);

      const token =
        response.replyAccessToken;

      if (!token) {
        throw new Error(
          "Reply access token missing from response",
        );
      }

      const fallbackMessageData: MessageData =
        {
          originalMessage: data.content,
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
          originalMessage:
            data.content,
          savedAt:
            new Date().toISOString(),
        },
        messageData,
      );

      setHistoryPage(1);
      selectConversation(token);

      form.reset({
        content: "",
      });
    } catch (error) {
      const axiosError =
        error as AxiosError<ApiResponse>;

      toast.error(
        axiosError.response?.data.message ??
          "Failed to send message",
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!mounted) {
    return (
      <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl space-y-6 px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase text-muted-foreground">
                Public profile
              </p>

              <h1 className="text-3xl font-bold">
                Send an anonymous message to
                @{username}
              </h1>

              <p className="max-w-2xl text-muted-foreground">
                Your identity is not shared.
                Keep your token after sending
                if you want to read future
                replies.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Your message
                </CardTitle>

                <CardDescription>
                  Write something specific and
                  respectful.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(
                      onSubmit,
                    )}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Write your anonymous message..."
                              className="min-h-40 resize-none bg-background"
                              {...field}
                            />
                          </FormControl>

                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Minimum 10
                              characters
                            </span>
                            <span>
                              {
                                messageContent.trim()
                                  .length
                              }
                              /300
                            </span>
                          </div>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={
                          isSending ||
                          !messageContent.trim()
                        }
                        className="sm:w-44"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="h-20 animate-pulse rounded bg-muted/30" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-5">
                <p className="text-sm font-medium">
                  Want your own anonymous
                  inbox?
                </p>

                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/sign-up">
                    Create account
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="h-80 animate-pulse rounded-lg bg-muted/30 p-5" />
          </Card>

          <Card>
            <CardContent className="h-80 animate-pulse rounded-lg bg-muted/30 p-5" />
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl space-y-6 px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Send an anonymous message to
              @{username}
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Your message
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(
                    onSubmit,
                  )}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Write your anonymous message and be respectful..."
                            className="min-h-40 resize-none bg-background"
                            {...field}
                          />
                        </FormControl>

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            Minimum 10
                            characters
                          </span>
                          <span>
                            {
                              messageContent.trim()
                                .length
                            }
                            /300
                          </span>
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        isSending ||
                        !messageContent.trim()
                      }
                      className="sm:w-44"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          {replyAccessToken && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Current reply token
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-lg border border-primary/20 bg-background p-3">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 break-all pt-1 font-mono text-xs">
                      {replyAccessToken}
                    </p>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleCopyToken(
                          replyAccessToken,
                        )
                      }
                      className="shrink-0"
                    >
                      {copiedToken ===
                      replyAccessToken ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RefreshCcw className="h-5 w-5 text-primary" />
                Enter your token
              </CardTitle>

              <CardDescription>
                Paste any saved token to load
                that conversation.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <Textarea
                placeholder="Paste your reply token here..."
                value={manualToken}
                onChange={(event) =>
                  setManualToken(
                    event.target.value,
                  )
                }
                className="min-h-24 resize-none font-mono text-xs"
              />

              <Button
                type="button"
                onClick={handleManualTokenFetch}
                disabled={
                  isLoadingReplies ||
                  !manualToken.trim()
                }
                className="w-full"
              >
                {isLoadingReplies ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading replies
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4" />
                    View replies
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-medium">
                Want your own anonymous
                inbox?
              </p>

              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/sign-up">
                  Create account
                </Link>
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
              Saved reply tokens
            </CardTitle>

            <CardDescription>
              Stored on this device and
              loaded automatically when you
              return.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-4">
            {isLoadingHistory ? (
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
                      replyAccessToken
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
                            replyAccessToken && (
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
                          void handleCopyToken(
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
                Saved conversations will
                appear here after you send a
                message or load a token.
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
                reply-token history.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              {currentConversation ? (
                <>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Your message
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

                  {replies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No replies yet. Check back
                      soon.
                    </p>
                  ) : (
                    <div className="flex flex-1 flex-col gap-4">
                      <div className="space-y-3">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Replies ({replies.length})
                        </p>

                        <div className="max-h-[24rem] space-y-3 overflow-y-auto pr-1">
                          {visibleReplies.map(
                            (
                              reply,
                              index,
                            ) => (
                              <div
                                key={`${reply.createdAt}-${index}`}
                                className="rounded-lg border bg-card p-3"
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
                      </div>

                      <PaginationControls
                        currentPage={currentReplyPage}
                        totalPages={replyTotalPages}
                        onPageChange={setReplyPage}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a saved conversation to
                  review replies here.
                </p>
              )}
            </CardContent>
          </Card>
      </div>
    </main>
  );
}
