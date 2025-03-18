import { getWebActionProcessors } from 'quidproquo-actionprocessor-web';
import {
  ActionProcessorListResolver,
  AskResponseReturnType,
  createRuntime,
  defineModule,
  QpqFunctionRuntime,
  QpqRuntimeType,
  Story,
  StoryResolver,
} from 'quidproquo-core';

import { useCallback, useMemo } from 'react';

import { useQpqContextValues } from './asmj';

// WIP ~ useFastCallback, wack things like loggers in a context, try to only make once instance of the runtime.
// Also don't create every refresh.. useMemo / useCallback etc

const logger = {
  enableLogs: async () => {},
  log: async () => {},
  waitToFinishWriting: async () => {},
  moveToPermanentStorage: async () => {},
};

export function useQpq(getActionProcessors: ActionProcessorListResolver = async () => ({})): StoryResolver {
  const qpqContextValues = useQpqContextValues();

  const resolveStory = useMemo(
    () =>
      createRuntime(
        [defineModule('UI')],
        {
          depth: 0,
          context: qpqContextValues,
        },
        async (qpqConfig, dynamicModuleLoader) => ({
          ...(await getWebActionProcessors(qpqConfig, dynamicModuleLoader)),
          ...(await getActionProcessors(qpqConfig, dynamicModuleLoader)),
        }),
        () => new Date().toISOString(),
        logger,
        `frontend::${'uuid'}`,
        QpqRuntimeType.UI,
        async (_runtime: QpqFunctionRuntime) => {
          // noop
        },
      ),
    [qpqContextValues],
  );

  const qpq = useCallback(
    function getStoryExecutor<S extends Story<any, any>>(story: S): (...args: Parameters<S>) => Promise<AskResponseReturnType<ReturnType<S>>> {
      return async (...args: Parameters<S>) => {
        const result = await resolveStory(story, args);

        if (result.error) {
          throw new Error(result.error.errorText);
        }

        return result.result;
      };
    },
    [resolveStory],
  );

  return qpq;
}
