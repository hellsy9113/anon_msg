import { Message } from "@/modal/user";
import { MessageData } from "@/features/messages/types/replyAccess";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessage?: boolean;
  messages?: Array<Message>;
  replyAccessToken?: string;
  messageData?: MessageData;
}
