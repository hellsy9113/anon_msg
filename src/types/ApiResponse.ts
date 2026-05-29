import { Message } from "@/modal/user"
export interface ApiResponse{
    success:boolean,
    message:string,
    isAcceptingMessage?:boolean
    messages?:Array<Message>

  replyAccessToken?: string;

  messageData?: {
    originalMessage: string;

    createdAt: string;

    replies: {
      content: string;
      createdAt: string;
    }[];
  };
}
