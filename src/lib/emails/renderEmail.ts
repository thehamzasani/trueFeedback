import { render } from '@react-email/render';
import VerificationEmail from '../../../emails/VerificationEmail';

export async function renderEmail(
  username: string,
  verifyCode: string
): Promise<string> {
  const html = render(
    VerificationEmail({ username, otp: verifyCode })
  );
  return html;
}
