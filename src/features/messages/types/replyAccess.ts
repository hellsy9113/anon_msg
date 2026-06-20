export interface ReplyItem {
  content: string;
  createdAt: string;
}

export interface MessageData {
  originalMessage: string;
  createdAt: string;
  replies: ReplyItem[];
}

export type ReplyTokenFeature = "default" | "question";

export interface ReplyTokenRecord {
  token: string;
  username: string;
  feature: ReplyTokenFeature;
  questionId?: string;
  originalMessage?: string;
  savedAt?: string;
}

export interface ReplyConversation extends ReplyTokenRecord {
  messageData: MessageData;
}
