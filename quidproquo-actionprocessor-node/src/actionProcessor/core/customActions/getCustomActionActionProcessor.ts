import { QPQConfig, ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, qpqCoreUtils } from 'quidproquo-core';

const getProcessCustomAction = async (qpqConfig: QPQConfig, dynamicModuleLoader: DynamicModuleLoader): Promise<ActionProcessorList> => {
  try {
    const getCustomActionProcessors = qpqCoreUtils.getActionProcessorSources(qpqConfig);

    const possibleModules: ActionProcessorListResolver[] = await Promise.all(getCustomActionProcessors.map((x) => dynamicModuleLoader(x)));
    const modules = possibleModules.filter((m) => typeof m === 'function');
    const actionProcessors = await Promise.all(modules.flatMap((m) => m(qpqConfig, dynamicModuleLoader)));

    const allActionProcessors = actionProcessors.reduce((acc, cur) => ({ ...acc, ...cur }), {});
    return allActionProcessors;
  } catch {
    console.log('Unable to dynamically load action processors');

    return {};
  }
};
export const getCustomActionActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getProcessCustomAction(qpqConfig, dynamicModuleLoader)),
});
