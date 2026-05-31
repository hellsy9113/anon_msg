import { resend } from "../lib/resend";
import VerificationEmail from "../../emails/VerificationEmails";
import { ApiResponse } from "../types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifycode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "noreply@notification.akarshh.me",
      to: email,
      subject: "Mystery Message | Verification Code",

      react: (
        <VerificationEmail
          username={username}
          otp={verifycode}
        />
      ),
    });

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (emailError) {
    console.error(
      "Error sending verification email:",
      emailError
    );

    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}