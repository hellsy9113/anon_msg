import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import QuesModel from "@/modal/question";
import UserModel from "@/modal/user";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
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

    // IMPORTANT
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

    const updateResult = await UserModel.updateOne(
      {
        _id: user._id,
      },
      {
        $pull: {
          messages: {
            _id: new mongoose.Types.ObjectId(messageid),
          },
        },
      }
    );

    if (updateResult.modifiedCount > 0) {
      return Response.json(
        {
          success: true,
          message: "Message deleted successfully",
        },
        { status: 200 }
      );
    }

    const questionUpdateResult = await QuesModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(user._id),
      },
      {
        $pull: {
          messages: {
            _id: new mongoose.Types.ObjectId(messageid),
          },
        },
      }
    );

    if (questionUpdateResult.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error deleting message:", error);

    return Response.json(
      {
        success: false,
        message: "Error deleting message",
      },
      { status: 500 }
    );
  }
}
