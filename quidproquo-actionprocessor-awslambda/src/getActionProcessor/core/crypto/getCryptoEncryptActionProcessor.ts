import { envelopeEncrypt } from 'quidproquo-actionprocessor-node';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  CryptoActionType,
  CryptoEncryptActionProcessor,
  CryptoEncryptErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { createKmsDataKeyProvider, resolveCryptoKeyAlias } from './utils';

const getProcessCryptoEncrypt = (qpqConfig: QPQConfig): CryptoEncryptActionProcessor => {
  return async ({ keyName, plaintext, context }) => {
    const keyAlias = resolveCryptoKeyAlias(keyName, qpqConfig);
    if (!keyAlias) {
      return actionResultError(
        CryptoEncryptErrorTypeEnum.KeyNotConfigured,
        `Crypto key not configured: [${keyName}] - declare it with defineCryptoKey`,
      );
    }

    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      const ciphertext = await envelopeEncrypt(plaintext, context, createKmsDataKeyProvider(keyAlias, region));
      return actionResult(ciphertext);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        NotFoundException: () => actionResultError(CryptoEncryptErrorTypeEnum.KeyUnavailable, `Crypto key not found: [${keyName}]`),
        DisabledException: () => actionResultError(CryptoEncryptErrorTypeEnum.KeyUnavailable, `Crypto key is disabled: [${keyName}]`),
        KMSInvalidStateException: () =>
          actionResultError(CryptoEncryptErrorTypeEnum.KeyUnavailable, `Crypto key is in an unusable state: [${keyName}]`),
        AccessDeniedException: () => actionResultError(CryptoEncryptErrorTypeEnum.KeyUnavailable, `Access denied to crypto key: [${keyName}]`),
        ThrottlingException: () => actionResultError(CryptoEncryptErrorTypeEnum.Throttling, 'Throttling: Rate exceeded'),
      });
    }
  };
};

export const getCryptoEncryptActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [CryptoActionType.Encrypt]: getProcessCryptoEncrypt(qpqConfig),
});
