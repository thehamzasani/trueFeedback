import nodemailer from 'nodemailer';
import { ApiResponse } from '@/types/ApiResponse';
import { renderEmail } from './renderEmail';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Render the React component to HTML
    const htmlContent = await renderEmail(username, verifyCode);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mystery Message Verification Code',
      html: htmlContent,
    });

    return { success: true, message: 'Verification email sent successfully.' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, message: 'Failed to send verification email.' };
  }
}
