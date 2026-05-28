import { Message } from "@/modal/user"
export interface ApiResponse{
    success:boolean,
    message:string,
    isAcceptingMessage?:boolean
    messages?:Array<Message>
}
