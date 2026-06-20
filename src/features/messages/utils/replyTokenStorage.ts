import {
  ReplyTokenFeature,
  ReplyTokenRecord,
} from "@/features/messages/types/replyAccess";

const REPLY_TOKEN_STORAGE_KEY = "replyTokens";

const isReplyTokenFeature = (
  value: unknown,
): value is ReplyTokenFeature =>
  value === "default" || value === "question";

const normalizeReplyTokenRecord = (
  value: unknown,
): ReplyTokenRecord | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as {
    token?: unknown;
    username?: unknown;
    feature?: unknown;
    questionId?: unknown;
    originalMessage?: unknown;
    savedAt?: unknown;
    createdAt?: unknown;
  };

  const token =
    typeof record.token === "string"
      ? record.token.trim()
      : "";

  const username =
    typeof record.username === "string"
      ? record.username.trim()
      : "";

  if (!token || !username) {
    return null;
  }

  const feature = isReplyTokenFeature(record.feature)
    ? record.feature
    : typeof record.questionId === "string" &&
        record.questionId.trim()
      ? "question"
      : "default";

  return {
    token,
    username,
    feature,
    questionId:
      typeof record.questionId === "string" &&
      record.questionId.trim()
        ? record.questionId.trim()
        : undefined,
    originalMessage:
      typeof record.originalMessage === "string" &&
      record.originalMessage.trim()
        ? record.originalMessage
        : undefined,
    savedAt:
      typeof record.savedAt === "string" &&
      record.savedAt.trim()
        ? record.savedAt
        : typeof record.createdAt === "string" &&
            record.createdAt.trim()
          ? record.createdAt
          : undefined,
  };
};

const sortReplyTokenRecords = (
  records: ReplyTokenRecord[],
) =>
  [...records].sort((left, right) => {
    const leftTime = left.savedAt
      ? new Date(left.savedAt).getTime()
      : 0;

    const rightTime = right.savedAt
      ? new Date(right.savedAt).getTime()
      : 0;

    return rightTime - leftTime;
  });

export const getStoredReplyTokenRecords = (): ReplyTokenRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue =
      localStorage.getItem(REPLY_TOKEN_STORAGE_KEY);

    const parsedValue = JSON.parse(storedValue || "[]");

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sortReplyTokenRecords(
      parsedValue
        .map(normalizeReplyTokenRecord)
        .filter(
          (
            record,
          ): record is ReplyTokenRecord =>
            record !== null,
        ),
    );
  } catch {
    return [];
  }
};

export const getScopedReplyTokenRecords = ({
  username,
  feature,
  questionId,
}: {
  username: string;
  feature: ReplyTokenFeature;
  questionId?: string;
}): ReplyTokenRecord[] =>
  getStoredReplyTokenRecords().filter(
    (record) =>
      record.username === username &&
      record.feature === feature &&
      (feature !== "question" ||
        record.questionId === questionId),
  );

export const upsertReplyTokenRecord = (
  nextRecord: ReplyTokenRecord,
): ReplyTokenRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const normalizedRecord =
    normalizeReplyTokenRecord({
      ...nextRecord,
      savedAt:
        nextRecord.savedAt ??
        new Date().toISOString(),
    });

  if (!normalizedRecord) {
    return getStoredReplyTokenRecords();
  }

  const currentRecords =
    getStoredReplyTokenRecords();

  const previousRecord = currentRecords.find(
    (record) =>
      record.token === normalizedRecord.token,
  );

  const mergedRecord: ReplyTokenRecord = {
    ...previousRecord,
    ...normalizedRecord,
    originalMessage:
      normalizedRecord.originalMessage ??
      previousRecord?.originalMessage,
    questionId:
      normalizedRecord.questionId ??
      previousRecord?.questionId,
    savedAt:
      normalizedRecord.savedAt ??
      previousRecord?.savedAt ??
      new Date().toISOString(),
  };

  const nextRecords = sortReplyTokenRecords(
    currentRecords
      .filter(
        (record) =>
          record.token !== mergedRecord.token,
      )
      .concat(mergedRecord),
  );

  localStorage.setItem(
    REPLY_TOKEN_STORAGE_KEY,
    JSON.stringify(nextRecords),
  );

  return nextRecords;
};

export const getLatestScopedReplyTokenRecord = ({
  username,
  feature,
  questionId,
}: {
  username: string;
  feature: ReplyTokenFeature;
  questionId?: string;
}) =>
  getScopedReplyTokenRecords({
    username,
    feature,
    questionId,
  })[0] ?? null;

export const migrateLegacyQuestionReplyToken = ({
  username,
  questionId,
}: {
  username: string;
  questionId: string;
}) => {
  if (typeof window === "undefined") {
    return "";
  }

  const legacyStorageKey =
    `reply-token-${questionId}`;

  const legacyToken =
    localStorage
      .getItem(legacyStorageKey)
      ?.trim() ?? "";

  if (!legacyToken) {
    return "";
  }

  const existingRecord =
    getStoredReplyTokenRecords().find(
      (record) =>
        record.token === legacyToken,
    );

  if (existingRecord) {
    return legacyToken;
  }

  upsertReplyTokenRecord({
    token: legacyToken,
    username,
    feature: "question",
    questionId,
  });

  return legacyToken;
};

export const setLegacyQuestionReplyToken = ({
  questionId,
  token,
}: {
  questionId: string;
  token: string;
}) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    `reply-token-${questionId}`,
    token,
  );
};
