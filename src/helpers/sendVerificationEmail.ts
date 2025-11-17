// "use server"
// import nodemailer from "nodemailer";
// import VerificationEmail from "../../emails/VerificationEmail";
// import { ApiResponse } from "@/types/ApiResponse";
// import { renderToString } from "react-dom/server";

// export async function sendVerificationEmail(
//   email: string,
//   username: string,
//   verifyCode: string
// ): Promise<ApiResponse> {
//   try {
//     // Create transporter
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // Convert React component to HTML string
//     const htmlContent = renderToString(
//       VerificationEmail({ username, otp: verifyCode })
//     );

//     // Send mail
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Mystery Message Verification Code",
//       html: htmlContent,
//     });

//     return { success: true, message: "Verification email sent successfully." };
//   } catch (error) {
//     console.error("Email send error:", error);
//     return { success: false, message: "Failed to send verification email." };
//   }
// }
