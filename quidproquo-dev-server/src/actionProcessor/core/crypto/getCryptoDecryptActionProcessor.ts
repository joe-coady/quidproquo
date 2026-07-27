import { createLocalMasterKeyDataKeyProvider, envelopeDecrypt } from 'quidproquo-actionprocessor-node';
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
  qpqCoreUtils,
} from 'quidproquo-core';

import { getOrSeedCryptoMasterKey } from '../../../logic/cryptoKeys';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessCryptoDecrypt = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): CryptoDecryptActionProcessor => {
  return async ({ keyName, ciphertext, context }) => {
    const cryptoKeyConfig = qpqCoreUtils.getAllCryptoKeyConfigs(qpqConfig).find((k) => k.keyName === keyName);
    if (!cryptoKeyConfig) {
      return actionResultError(
        CryptoDecryptErrorTypeEnum.KeyNotConfigured,
        `Crypto key not configured: [${keyName}] - declare it with defineCryptoKey`,
      );
    }

    try {
      const masterKey = await getOrSeedCryptoMasterKey(devServerConfig.runtimePath, keyName, qpqConfig);
      const plaintext = await envelopeDecrypt(ciphertext, context, createLocalMasterKeyDataKeyProvider(masterKey));

      return actionResult(plaintext);
    } catch (error: unknown) {
      // Context mismatch and corruption must be distinguishable in dev exactly
      // as they are in prod - this is the only chance to catch scoping bugs
      // before deploy
      return actionResultErrorFromCaughtError(error, {
        QpqCryptoContextMismatch: (e) => actionResultError(CryptoDecryptErrorTypeEnum.ContextMismatch, e.message),
        QpqCryptoMalformedCiphertext: (e) => actionResultError(CryptoDecryptErrorTypeEnum.MalformedCiphertext, e.message),
      });
    }
  };
};

export const getCryptoDecryptActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [CryptoActionType.Decrypt]: getProcessCryptoDecrypt(qpqConfig, devServerConfig),
  });
