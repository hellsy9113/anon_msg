import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import QuesModel from "@/modal/question";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }
    const user: User = session.user as User;
    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Content is required",
        },
        { status: 400 },
      );
    }
    const userId = user._id;
    const newQuestion = new QuesModel({
      content,
      createdAt: new Date(),
      userId,
      messages: [],
    });
    await newQuestion.save();
    return NextResponse.json(
      {
        success: true,
        message: "Question created successfully",
        question: newQuestion,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("Error saving Question");
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
