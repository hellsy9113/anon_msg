import { resend } from "../lib/resend"

import VerificationEmail from "../../emails/VerificationEmails";
import { ApiResponse } from "../types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifycode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'mystry message | verification code',
            react: await VerificationEmail({ username, otp: verifycode }),
        });
        return {
            success: true, message: ' send verification eamil successfuly'
        }
    }
    catch (emailError) {
        console.log("error sending verification email", emailError)
        return {
            success: false, message: 'failed to send verification eamil'
        }
    }
}