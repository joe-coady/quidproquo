import { EmailTemplate } from './types';

export const verifyEmailTemplate: EmailTemplate = {
  subject: 'Verify your email: {{code}}',
  body: 'The verification code to your new account is {{code}}',
};
