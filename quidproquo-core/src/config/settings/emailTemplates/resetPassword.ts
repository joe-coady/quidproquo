import { EmailTemplate } from './types';

export const resetPassword: EmailTemplate = {
  subject: 'Reset Password',
  body: 'Your temporary password is {{code}}. Please log in and change it within 24 hours.',
};
