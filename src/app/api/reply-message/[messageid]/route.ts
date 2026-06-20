import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import QuesModel from "@/modal/question";
import UserModel from "@/modal/user";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageid: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const user: User = session.user as User;

    const { messageid } = await params;

    if (!mongoose.Types.ObjectId.isValid(messageid)) {
      return Response.json(
        {
          success: false,
          message: "Invalid message id",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return Response.json(
        {
          success: false,
          message: "Reply content required",
        },
        { status: 400 }
      );
    }

    const replyPayload = {
      content,
      createdAt: new Date(),
    };

    const updatedUserWithReply = await UserModel.findOneAndUpdate(
      {
        _id: user._id,
        "messages._id": new mongoose.Types.ObjectId(messageid),
      },
      {
        $push: {
          "messages.$.replies": replyPayload,
        },
      },
      {
        new: true,
      }
    );

    if (updatedUserWithReply) {
      return Response.json(
        {
          success: true,
          message: "Reply added successfully",
        },
        { status: 200 }
      );
    }

    const updatedQuestionWithReply = await QuesModel.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(user._id),
        "messages._id": new mongoose.Types.ObjectId(messageid),
      },
      {
        $push: {
          "messages.$.replies": replyPayload,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedQuestionWithReply) {
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
        message: "Reply added successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding reply:", error);

    return Response.json(
      {
        success: false,
        message: "Error adding reply",
      },
      { status: 500 }
    );
  }
}
