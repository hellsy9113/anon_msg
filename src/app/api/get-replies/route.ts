import dbConnect  from "@/lib/dbConnect";
import QuesModel from "@/modal/question";
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

      const userMessage = user?.messages.find(
        (msg) => msg.replyAccessToken === replyAccessToken
      );

      if (userMessage) {
        return Response.json(
          {
            success: true,
            messageData: {
              originalMessage: userMessage.content,
              createdAt: userMessage.createdAt,
              replies: userMessage.replies,
            },
          },
          { status: 200 }
        );
      }

      const question = await QuesModel.findOne({
        "messages.replyAccessToken": replyAccessToken,
      });

      const questionMessage = question?.messages.find(
        (msg) => msg.replyAccessToken === replyAccessToken
      );

    if (!questionMessage) {
      return Response.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,

        messageData: {
          originalMessage:
            questionMessage.content,

          createdAt:
            questionMessage.createdAt,

          replies:
            questionMessage.replies,
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
