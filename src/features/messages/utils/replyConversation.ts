import {
  ReplyConversation,
} from "@/features/messages/types/replyAccess";

export const sortConversations = (
  conversations: ReplyConversation[],
) =>
  [...conversations].sort((left, right) => {
    const leftTime = left.savedAt
      ? new Date(left.savedAt).getTime()
      : 0;

    const rightTime = right.savedAt
      ? new Date(right.savedAt).getTime()
      : 0;

    return rightTime - leftTime;
  });

export const upsertConversation = (
  conversations: ReplyConversation[],
  nextConversation: ReplyConversation,
) =>
  sortConversations(
    conversations
      .filter(
        (conversation) =>
          conversation.token !==
          nextConversation.token,
      )
      .concat(nextConversation),
  );
