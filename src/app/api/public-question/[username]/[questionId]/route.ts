import mongoose from "mongoose";
import { NextResponse } from "next/server";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";
import QuesModel from "@/modal/question";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      username: string;
      questionId: string;
    }>;
  }
) {
  try {
    await dbConnect();

    const { username, questionId } = await params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid question id",
        },
        { status: 400 }
      );
    }

    // Find the owner
    const user = await UserModel.findOne({
      username,
    }).select("_id username");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Verify the question belongs to this user
    const question = await QuesModel.findOne(
      {
        _id: new mongoose.Types.ObjectId(questionId),
        userId: user._id,
      },
      {
        _id: 1,
        content: 1,
        isAcceptingMessage: 1,
      }
    ).lean();

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        question: {
          ...question,
          isAcceptingMessage: question.isAcceptingMessage ?? true,
        },
        owner: {
          username: user.username,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching public question:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
