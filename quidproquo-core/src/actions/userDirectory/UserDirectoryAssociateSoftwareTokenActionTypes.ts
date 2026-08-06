import { UserDirectoryActionType } from './UserDirectoryActionType';

export interface AssociateSoftwareTokenResult {
  // Base32 secret used to seed the authenticator app (and to build the
  // otpauth:// URI / QR code shown to the user).
  secretCode: string;

  // Refreshed Cognito session to carry into the verify/respond step.
  session: string;
}

// Payload
export interface UserDirectoryAssociateSoftwareTokenActionPayload {
  userDirectoryName: string;

  session: string;
}
