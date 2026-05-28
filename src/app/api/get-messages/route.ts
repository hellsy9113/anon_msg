import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";

import mongoose from "mongoose";

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
    const userId = new mongoose.Types.ObjectId(user._id);

    const foundUser = await UserModel.aggregate([
      {
        $match: {
          _id: userId,
        },
      },

      {
        $unwind: "$messages",
      },

      {
        $sort: {
          "messages.createdAt": -1,
        },
      },

      {
        $group: {
          _id: "$_id",
          messages: {
            $push: "$messages",
          },
        },
      },
    ]);

    if (!foundUser || foundUser.length === 0) {
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

    return Response.json(
      {
        success: true,
        messages: foundUser[0].messages,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error getting messages:", error);

    return Response.json(
      {
        success: false,
        message: "Unexpected error while fetching messages",
      },
      {
        status: 500,
      }
    );
  }
}