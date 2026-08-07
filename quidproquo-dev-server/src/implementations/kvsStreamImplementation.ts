import { QPQConfig, qpqCoreUtils, QpqFunctionRuntime, QpqRuntimeType } from 'quidproquo-core';

import { getKvsStreamEventProcessor } from '../actionProcessor/core/event/kvsStream';
import { KvsStreamMessageWithSession } from '../actionProcessor/core/event/kvsStream/types';
import { eventBus, KVS_STREAM_EVENT_TOPIC, processEvent } from '../logic';
import { ResolvedDevServerConfig } from '../types';

const getDynamicModuleLoader = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig) => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return async (runtime: QpqFunctionRuntime): Promise<any> => devServerConfig.dynamicModuleLoader(serviceName, runtime);
};

/**
 * Runs stream handlers for local key-value store writes, mirroring queueImplementation.
 *
 * Only the service that OWNS the store runs its handler, or every service loaded into the dev
 * server would project the same change once each.
 *
 * A failing handler is logged, never rethrown: deployed, the stream sits downstream of a
 * committed write and a broken projector cannot roll it back, so failing the write locally
 * would be a difference that only shows up on dev.
 */
export const kvsStreamImplementation = async (devServerConfig: ResolvedDevServerConfig) => {
  eventBus.on(KVS_STREAM_EVENT_TOPIC, async (message: KvsStreamMessageWithSession) => {
    for (const qpqConfig of devServerConfig.qpqConfigs) {
      const ownsStore = qpqCoreUtils.getOwnedKeyValueStores(qpqConfig).some((store) => store.keyValueStoreName === message.record.keyValueStoreName);

      if (!ownsStore) {
        continue;
      }

      try {
        await processEvent<KvsStreamMessageWithSession, void>(
          message,
          qpqConfig,
          getDynamicModuleLoader(qpqConfig, devServerConfig),
          getKvsStreamEventProcessor,
          QpqRuntimeType.KVS_STREAM_EVENT,
          (event) => event.storySession,
          devServerConfig,
        );
      } catch (error) {
        console.error(`[kvs-stream] handler failed for ${message.record.keyValueStoreName}:`, error);
      }
    }
  });
};
