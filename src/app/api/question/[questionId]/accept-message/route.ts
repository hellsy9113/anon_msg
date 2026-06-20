import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import QuesModel from "@/modal/question";
import { acceptMessageSchema } from "@/features/messages/schemas/acceptMessageSchema";

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

    const question = await QuesModel.findOne(
      {
        _id: new mongoose.Types.ObjectId(questionId),
        userId: new mongoose.Types.ObjectId(session.user._id),
      },
      {
        isAcceptingMessage: 1,
      }
    ).lean();

    if (!question) {
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
        isAcceptingMessage: question.isAcceptingMessage ?? true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching question message setting:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch question settings",
      },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const validationResult = acceptMessageSchema.safeParse(await request.json());

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          message: "acceptMessages must be a boolean",
        },
        { status: 400 }
      );
    }

    const user = session.user as User;

    const updateResult = await QuesModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(questionId),
        userId: new mongoose.Types.ObjectId(user._id),
      },
      {
        $set: {
          isAcceptingMessage: validationResult.data.acceptMessages,
        },
      },
      {
        runValidators: true,
      }
    );

    if (updateResult.matchedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Question not found",
        },
        { status: 404 }
      );
    }

    const question = await QuesModel.findOne(
      {
        _id: new mongoose.Types.ObjectId(questionId),
        userId: new mongoose.Types.ObjectId(user._id),
      },
      {
        isAcceptingMessage: 1,
      }
    ).lean();

    const isAcceptingMessage =
      question?.isAcceptingMessage ?? validationResult.data.acceptMessages;

    return Response.json(
      {
        success: true,
        message: isAcceptingMessage
          ? "Question is now accepting responses"
          : "Question responses are paused",
        isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating question message setting:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update question settings",
      },
      { status: 500 }
    );
  }
}
