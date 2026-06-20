import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";
import bcrypt from "bcrypt";

import { sendVerificationEmail } from "@/features/auth/services/sendVerificationEmail";
import { signUpSchema } from "@/features/auth/schemas/signupSchema";
import { NextResponse } from "next/server";

//it is necssry to name the name the function post.as  route files use named export to
// determine which HTTP methods are supported
export async function POST(request: Request) {
  //request-variable and Request-typescript type of object Request
  //What Is Request?

  // Request is a built-in Web API class.

  // It represents the incoming HTTP request.

  // It contains:

  // body
  // headers
  // cookies
  // URL
  // method

  //wait for dbconnect to check whether the connection
  //instance is presenst .if not ,create new.
  await dbConnect();

  try {
    const requestBody = await request.json();
    const validationResult = signUpSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.issues[0]?.message ?? "Invalid signup data",
        },
        { status: 400 },
      );
    }

    const { username, email, password } = validationResult.data;
    const existingUserByUsername = await UserModel.findOne({ username });
    if (existingUserByUsername && existingUserByUsername.email !== email) {
      return NextResponse.json(
        {
          success: false,
          message: "username is already taken",
        },
        { status: 400 },
      );
    }
    const existingUserByEmail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000);

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "user already exists with this email",
          },
          { status: 400 },
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUserByEmail.username = username;
      existingUserByEmail.password = hashedPassword;
      existingUserByEmail.verifyCode = verifyCode.toString();
      existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
      await existingUserByEmail.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        isVerified: false,
        verifyCodeExpiry: expiryDate,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }
    //once the sign process is complete
    //we move to the verification process through otp
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode.toString(),
    );
    console.log("Email response:", emailResponse);
    if (emailResponse.success) {
      return Response.json(
        {
          success: true,
          message: "user registered successfully.verify email",
        },
        { status: 201 },
      );
    } else {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.log("Error registering user");
    //why stringfy -we can not send http body directly in the form of json object
    //it need to be converted to string
    //once the backend receive the string.it  reconvert the string to json
    //using .json()
    //     | JavaScript Object | JSON String              |
    // | ----------------- | ------------------------ |
    // | `{name:"Akarsh"}` | `'{"name":"Akarsh"}'`    |
    // | Real JS data      | Plain text               |
    // | Used in code      | Used in transfer/storage |
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
