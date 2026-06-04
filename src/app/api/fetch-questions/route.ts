import { getServerSession, User } from "next-auth";
import QuesModel from "@/modal/question";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        {
          status: 401,
        },
      );
    }
    const user: User = session.user as User;

    const userId_ = new mongoose.Types.ObjectId(user._id);

    const foundQues = await QuesModel.aggregate([
      {
        $match: {
          userId: userId_,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          messages: {
            $sortArray: {
              input: "$message",
              $sortBy: {
                createdAt: -1,
              },
            },
          },
          totalMessages: {
            $size: "$message",
          },
        },
      },
    ]);
  } catch (error) {
    console.log("error fetching question", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 },
    );
  }
}
