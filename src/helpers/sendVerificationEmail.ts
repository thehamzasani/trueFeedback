import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiReponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string,
): Promise<ApiReponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verification Code',
            react: VerificationEmail({username, otp: verifyCode}),
        });
        return { success: true, message: 'Email send successfully' }
    } catch (emailError) {
        console.error("Error sending verification email.", emailError)
        return { success: false, message: 'Failed to send verification email.' }
    }
}