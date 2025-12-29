import { getWebActionProcessors } from 'quidproquo-actionprocessor-web';
import {
  ActionProcessorListResolver,
  AskResponse,
  AskResponseReturnType,
  createRuntime,
  defineModule,
  QpqFunctionRuntime,
  QpqRuntimeType,
  Story,
  StoryResolver,
} from 'quidproquo-core';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useQpqContextValues } from './asmj/QpqContextProvider';

function* withVersionCheck<R>(story: AskResponse<R>, versionRef: React.RefObject<number>, capturedVersion: number): AskResponse<R | undefined> {
  let nextValue: any = undefined;

  while (true) {
    if (versionRef.current !== capturedVersion) {
      return undefined;
    }

    const { value, done } = story.next(nextValue);

    if (done) {
      return value;
    }

    nextValue = yield value;
  }
}

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
  const versionRef = useRef(0);

  useEffect(() => {
    return () => {
      versionRef.current++;
    };
  }, []);

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
        const capturedVersion = versionRef.current;
        const wrappedStory = (...storyArgs: Parameters<S>) => withVersionCheck(story(...storyArgs), versionRef, capturedVersion);
        const result = await resolveStory(wrappedStory, args);

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
