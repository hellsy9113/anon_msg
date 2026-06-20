import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";
import { z } from "zod";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        {
          status: 404,
        },
      );
    }
    const isCodeValid = user.verifyCode == code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        {
          status: 200,
        },
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "verification code expired,please sign-up again",
        },
        {
          status: 400,
        },
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "verification code wrong",
        },
        {
          status: 400,
        },
      );
    }
  } catch (error) {
    console.log("error checking code", error);
    return Response.json(
      {
        success: false,
        message: "error checking username",
      },
      {
        status: 500,
      },
    );
  }
}
