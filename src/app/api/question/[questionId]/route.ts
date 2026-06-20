import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import QuesModel from "@/modal/question";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const { questionId } = await params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid question id",
        },
        { status: 400 }
      );
    }

    const objectId = new mongoose.Types.ObjectId(questionId);
    const userId = new mongoose.Types.ObjectId(session.user._id);

    const questions = await QuesModel.aggregate([
      {
        $match: {
          _id: objectId,
          userId: userId,
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,

          messages: {
            $sortArray: {
              input: "$messages",
              sortBy: {
                createdAt: -1,
              },
            },
          },

          totalMessages: {
            $size: "$messages",
          },
        },
      },
    ]);

    if (questions.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Question not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        question: questions[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting question:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error",
      },
      { status: 500 }
    );
  }
}