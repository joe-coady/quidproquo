import { envelopeDecrypt } from 'quidproquo-actionprocessor-node';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  CryptoActionType,
  CryptoDecryptActionProcessor,
  CryptoDecryptErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { createKmsDataKeyProvider, resolveCryptoKeyAlias } from './utils';

const getProcessCryptoDecrypt = (qpqConfig: QPQConfig): CryptoDecryptActionProcessor => {
  return async ({ keyName, ciphertext, context }) => {
    const keyAlias = resolveCryptoKeyAlias(keyName, qpqConfig);
    if (!keyAlias) {
      return actionResultError(
        CryptoDecryptErrorTypeEnum.KeyNotConfigured,
        `Crypto key not configured: [${keyName}] - declare it with defineCryptoKey`,
      );
    }

    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      const plaintext = await envelopeDecrypt(ciphertext, context, createKmsDataKeyProvider(keyAlias, region));
      return actionResult(plaintext);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        // Named errors from the shared envelope logic, keyed by error.code
        QpqCryptoContextMismatch: (e) => actionResultError(CryptoDecryptErrorTypeEnum.ContextMismatch, e.message),
        QpqCryptoMalformedCiphertext: (e) => actionResultError(CryptoDecryptErrorTypeEnum.MalformedCiphertext, e.message),

        // KMS exceptions, keyed by error.name. The context hash was verified
        // before KMS was called, so an invalid wrapped key means tampering or
        // corruption, not a context mismatch.
        InvalidCiphertextException: () => actionResultError(CryptoDecryptErrorTypeEnum.MalformedCiphertext, 'Wrapped data key is not decryptable'),
        IncorrectKeyException: () =>
          actionResultError(CryptoDecryptErrorTypeEnum.MalformedCiphertext, `Ciphertext was not encrypted under crypto key: [${keyName}]`),
        NotFoundException: () => actionResultError(CryptoDecryptErrorTypeEnum.KeyUnavailable, `Crypto key not found: [${keyName}]`),
        DisabledException: () => actionResultError(CryptoDecryptErrorTypeEnum.KeyUnavailable, `Crypto key is disabled: [${keyName}]`),
        KMSInvalidStateException: () =>
          actionResultError(CryptoDecryptErrorTypeEnum.KeyUnavailable, `Crypto key is in an unusable state: [${keyName}]`),
        AccessDeniedException: () => actionResultError(CryptoDecryptErrorTypeEnum.KeyUnavailable, `Access denied to crypto key: [${keyName}]`),
        ThrottlingException: () => actionResultError(CryptoDecryptErrorTypeEnum.Throttling, 'Throttling: Rate exceeded'),
      });
    }
  };
};

export const getCryptoDecryptActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [CryptoActionType.Decrypt]: getProcessCryptoDecrypt(qpqConfig),
});
