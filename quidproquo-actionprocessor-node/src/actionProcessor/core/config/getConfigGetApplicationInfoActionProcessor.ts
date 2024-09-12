import {
  QPQConfig,
  actionResult,
  ConfigActionType,
  ConfigGetApplicationInfoActionProcessor,
  ApplicationConfigInfo,
  qpqCoreUtils,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

const getProcessConfigGetApplicationConfig = (qpqConfig: QPQConfig): ConfigGetApplicationInfoActionProcessor => {
  return async () => {
    const appInfo: ApplicationConfigInfo = {
      environment: qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
      feature: qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
      module: qpqCoreUtils.getApplicationModuleName(qpqConfig),
      name: qpqCoreUtils.getApplicationName(qpqConfig),
    };

    return actionResult(appInfo);
  };
};

export const getConfigGetApplicationInfoActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetApplicationInfo]: getProcessConfigGetApplicationConfig(qpqConfig),
});
