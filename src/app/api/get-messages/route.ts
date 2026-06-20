import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const user = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const foundUser = await UserModel.findById(user._id).select("messages");

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const messages = [...foundUser.messages].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );


    return Response.json(
      {
        success: true,
        messages,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error getting message:", error);

    return Response.json(
      {
        success: false,
        message: "Unexpected error while fetching message",
      },
      {
        status: 500,
      }
    );
  }
}
