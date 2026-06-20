import {getServerSession, User} from "next-auth"
import {authOptions}  from "../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user:User=session?.user as User;
 
  if(!session || !session.user)
  {
    return Response.json({

      success:false,
      message:"Not authenticated"
    },
  { status:500})
  }

  const userId=user._id;
  const{acceptMessages}=await request.json();

  try{

   const updatedUser= await UserModel.findByIdAndUpdate(
    userId,
    {isAcceptingMessage:acceptMessages},
    {new:true}
   )
   if(!updatedUser)
   {
    return Response.json({
      success:false,
      message:"failed to update user status to accept message"
    },{status:401})
   }
   else{
      return Response.json({
      success:true,
      message:"success to update user status to accept message",
      updatedUser
    },{status:200})
   }
  }
  catch(error)
  {
    console.log("failed to update ")
    return Response.json(
      {
    success:false,
    message:"failed to update user status to update message"
       } ,
  {status:401}
    )
}
}

export async function GET(request:Request)
{
  dbConnect();
   await dbConnect();
  const session = await getServerSession(authOptions);
  const user:User=session?.user as User;
 
  if(!session || !session.user)
  {
    return Response.json({

      success:false,
      message:"Not authenticated"
    },
  { status:500})
  }

  const userId=user._id;

try{
   const FoundUser= await UserModel.findById(userId);
 if(!FoundUser)
  {
    return Response.json({
      success:false,
      message:"User not Found"
    },{status:404})
  } 
  
    return Response.json({
      success:true,
      isAcceptingMessage:FoundUser.isAcceptingMessage
    },{status:200})
}
catch(error)
{
  console.log("failed to fetch user  message status")
  return Response.json({
    success:false,
    message:"Error occurred while fetching user status"
  },{status:500})
}
} 