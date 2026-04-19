import { CrossModuleOwner } from '../../types';
import { QPQConfigAdvancedSettings, QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';
import { convertCrossModuleOwnerToGenericResourceNameOverride } from '../utils/crossModuleUtils';
import { CustomAuthRuntime, EmailTemplates } from './emailTemplates';

export type AuthDirectoryDnsRecord = {
  subdomain: string;
  rootDomain: string;
};

export interface QPQConfigAdvancedUserDirectorySettings extends QPQConfigAdvancedSettings {
  phoneRequired?: boolean;

  selfSignUpEnabled?: boolean;

  emailTemplates?: EmailTemplates;

  owner?: CrossModuleOwner<'userDirectoryName'>;

  dnsRecord?: AuthDirectoryDnsRecord;

  customAuthRuntime?: CustomAuthRuntime;
}

export interface UserDirectoryQPQConfigSetting extends QPQConfigSetting {
  name: string;

  phoneRequired: boolean;

  selfSignUpEnabled: boolean;

  emailTemplates: EmailTemplates;

  owner?: CrossModuleOwner;

  dnsRecord?: AuthDirectoryDnsRecord;

  customAuthRuntime?: CustomAuthRuntime;
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

  owner: convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
});
