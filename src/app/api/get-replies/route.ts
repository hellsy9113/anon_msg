import dbConnect  from "@/lib/dbConnect";
import UserModel from "@/modal/user";
export async function POST(request:Request)
{
    try{
      await dbConnect();

      const {replyAccessToken}=await request.json();

      if(!replyAccessToken)
      {
        return Response.json(
              {
          success: false,
          message: "Reply access token required",
        },
        { status: 400 }
        )
      }
      const user=await UserModel.findOne({
        "messages.replyAccessToken":replyAccessToken
      });

      if(!user)
      {
           return Response.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 404 }
      );
      }
     
       const message = user.messages.find(
      (msg) =>
        msg.replyAccessToken ===
        replyAccessToken
    );

    if (!message) {
      return Response.json(
        {
          success: false,
          message: "Message not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,

        messageData: {
          originalMessage:
            message.content,

          createdAt:
            message.createdAt,

          replies:
            message.replies,
        },
      },
      { status: 200 }
    );

    }
    catch(error)
    {
     console.log("error fetching replies:",error)
       return Response.json(
      {
        success: false,
        message:
          "Error fetching replies",
      },
      { status: 500 }
    );
    }
}