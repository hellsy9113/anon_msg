import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import QuesModel from "@/modal/question";

export async function DELETE(
  _request: Request,
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

    const user = session.user as User;

    const deletedQuestion = await QuesModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(questionId),
      userId: new mongoose.Types.ObjectId(user._id),
    });

    if (!deletedQuestion) {
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
        message: "Question deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting question:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete question",
      },
      { status: 500 }
    );
  }
}
