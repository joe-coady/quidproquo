export interface QpqEmailTemplateSourceEntry {
  src: string;
  runtime: string;
}

export interface EmailTemplates {
  verifyEmail?: QpqEmailTemplateSourceEntry;
  resetPassword?: QpqEmailTemplateSourceEntry;
  resetPasswordAdmin?: QpqEmailTemplateSourceEntry;
}

export interface CustomAuthRuntime {
  defineAuthChallenge: QpqEmailTemplateSourceEntry;
  createAuthChallenge?: QpqEmailTemplateSourceEntry;
  verifyAuthChallenge?: QpqEmailTemplateSourceEntry;
}
