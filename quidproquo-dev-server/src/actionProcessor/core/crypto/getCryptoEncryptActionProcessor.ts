import { createLocalMasterKeyDataKeyProvider, envelopeEncrypt } from 'quidproquo-actionprocessor-node';
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
  qpqCoreUtils,
} from 'quidproquo-core';

import { getOrSeedCryptoMasterKey } from '../../../logic/cryptoKeys';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessCryptoEncrypt = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): CryptoEncryptActionProcessor => {
  return async ({ keyName, plaintext, context }) => {
    const cryptoKeyConfig = qpqCoreUtils.getAllCryptoKeyConfigs(qpqConfig).find((k) => k.keyName === keyName);
    if (!cryptoKeyConfig) {
      return actionResultError(
        CryptoEncryptErrorTypeEnum.KeyNotConfigured,
        `Crypto key not configured: [${keyName}] - declare it with defineCryptoKey`,
      );
    }

    try {
      const masterKey = await getOrSeedCryptoMasterKey(devServerConfig.runtimePath, keyName, qpqConfig);
      const ciphertext = await envelopeEncrypt(plaintext, context, createLocalMasterKeyDataKeyProvider(masterKey));

      return actionResult(ciphertext);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getCryptoEncryptActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [CryptoActionType.Encrypt]: getProcessCryptoEncrypt(qpqConfig, devServerConfig),
  });
