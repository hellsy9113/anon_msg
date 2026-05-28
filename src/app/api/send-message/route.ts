import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";

import { Message } from "@/modal/user";

export async function POST(request:Request)
{
    await dbConnect();
    const {username,content}=  await request.json()
    try{
     const user=await  UserModel.findOne({username})
     if(!user)
     {
        return Response.json({
            success:false,
            message:"user not found"
        },{status:404})  
     }
     if(!user.isAcceptingMessage)
     {
           return Response.json({
            success:false,
            message:"user is not accepting message"
        },{status:404})  
     }
     const newMessage={content,createdAt:new Date()}
     user.messages.push(newMessage as Message)
     await user.save();

       return Response.json({
            success:true,
            message:"message sent successfully"
        },{status:200})   
    }
    catch(error){
              console.log("error adding messages",error)
            return Response.json({
            success:false,
            message:"unexpexted error to send  message"
        },{status:500})     
    }

}