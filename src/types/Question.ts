import { Message } from "@/modal/user"

export interface Question {
  _id: string;
  content: string;
  createdAt: string;
  totalMessages: number;
  messages: Message[];
}