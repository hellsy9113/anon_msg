import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";
import { z } from "zod";
import { usernameValidation } from "@/features/auth/schemas/signupSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
   //todo 
   if(request.method !=='GET')
   {
     return Response.json({
      success:false,
      message:'only get operation is allowed'
     })
   }   //not needed in new version of nextjs
  await dbConnect();
  //  localhost:3000/api/cuu?username-akarsh?phone=android
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    //validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log(result);
    if (!result.success) {
      const usernameErorrs = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErorrs?.length > 0
              ? usernameErorrs.join(",")
              : "Invalid query parameters",
        },
        { status: 400 },
      );
    }
    const { username } = result.data;
     const existingUser=await UserModel.findOne({ username });

     if(existingUser){
        return Response.json({
            success:false,
            message:'username is already taken'
        })
     }
    return Response.json({
      success: true,
      message: "Username is unique",
    });
  } catch (error) {
    console.log("error checking username", error);
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
