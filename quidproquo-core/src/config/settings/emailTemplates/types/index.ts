export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailTemplates {
  verifyEmail?: EmailTemplate;
  resetPassword?: EmailTemplate;
}
