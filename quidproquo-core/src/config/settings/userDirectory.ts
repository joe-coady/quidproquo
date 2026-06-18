import { CrossModuleOwner } from '../../types';
import { QPQConfigAdvancedSettings, QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';
import { convertCrossModuleOwnerToGenericResourceNameOverride } from '../utils/crossModuleUtils';
import { CustomAuthRuntime, EmailTemplates } from './emailTemplates';

export type AuthDirectoryDnsRecord = {
  subdomain: string;
  rootDomain: string;
};

export enum UserDirectoryMfaMode {
  off = 'off',
  optional = 'optional',
  required = 'required',
}

export enum UserDirectoryMfaSecondFactor {
  totp = 'totp',
  // sms = 'sms', // future — additionally needs phone + SNS role infra.
}

export interface UserDirectoryMfaSettings {
  mode: UserDirectoryMfaMode;

  // Enabled second factors. Defaults to [totp] when omitted.
  secondFactors?: UserDirectoryMfaSecondFactor[];
}

export interface QPQConfigAdvancedUserDirectorySettings extends QPQConfigAdvancedSettings {
  phoneRequired?: boolean;

  selfSignUpEnabled?: boolean;

  emailTemplates?: EmailTemplates;

  owner?: CrossModuleOwner<'userDirectoryName'>;

  dnsRecord?: AuthDirectoryDnsRecord;

  customAuthRuntime?: CustomAuthRuntime;

  mfa?: UserDirectoryMfaSettings;
}

export interface UserDirectoryQPQConfigSetting extends QPQConfigSetting {
  name: string;

  phoneRequired: boolean;

  selfSignUpEnabled: boolean;

  emailTemplates: EmailTemplates;

  owner?: CrossModuleOwner;

  dnsRecord?: AuthDirectoryDnsRecord;

  customAuthRuntime?: CustomAuthRuntime;

  mfa: UserDirectoryMfaSettings;
}

export const defineUserDirectory = (name: string, options?: QPQConfigAdvancedUserDirectorySettings): UserDirectoryQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.userDirectory,
  uniqueKey: name,

  name,

  phoneRequired: options?.phoneRequired || false,

  selfSignUpEnabled: options?.selfSignUpEnabled ?? false,

  emailTemplates: {
    verifyEmail: options?.emailTemplates?.verifyEmail,
    resetPassword: options?.emailTemplates?.resetPassword,
    resetPasswordAdmin: options?.emailTemplates?.resetPasswordAdmin,
  },

  dnsRecord: options?.dnsRecord,
  customAuthRuntime: options?.customAuthRuntime,

  mfa: {
    mode: options?.mfa?.mode ?? UserDirectoryMfaMode.off,
    secondFactors: options?.mfa?.secondFactors?.length ? options.mfa.secondFactors : [UserDirectoryMfaSecondFactor.totp],
  },

  owner: convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
});
