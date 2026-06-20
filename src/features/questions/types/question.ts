import { Message } from "@/modal/user"

export interface Question {
  _id: string;
  content: string;
  createdAt: string;
  isAcceptingMessage: boolean;
  totalMessages: number;
  messages: Message[];
}

export interface PublicQuestion {
  _id: string;
  content: string;
  isAcceptingMessage: boolean;
}
