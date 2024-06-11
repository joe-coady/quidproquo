import {
  QPQConfig,
  QpqRuntimeType,
  StorySession,
  getQpqRuntimeForStory,
  StoryResult,
  QpqLogger,
  qpqCoreUtils,
  AskResponse,
  defineApplicationVersion,
  defineModule,
  defineApplication,
  actionResultError,
  deepCompare,
  ErrorTypeEnum,
  askRemoveBatch,
} from 'quidproquo-core';
import { QpqActionMock } from './mockAction';
import { randomUUID } from 'crypto';

const defaultQpqConfig: QPQConfig = [
  defineApplication('test', 'development', __dirname, 'us-east-1'),
  defineModule('test'),
  defineApplicationVersion('1'),
];

type TestRuntimeOptions = {
  qpqConfig?: QPQConfig;
  storySession?: StorySession;
  ignoreBatch?: boolean;
};

export type TestRuntimeResult<InputParameters extends any[]> = {
  execute: (...inputParameters: InputParameters) => Promise<StoryResult<any>>;
};

const getMockLogger = (): QpqLogger => {
  return {
    log: async (res: StoryResult<any>) => {},
    moveToPermanentStorage: async () => {},
    waitToFinishWriting: async () => {},
  };
};

export const getRuntimeCorrelation = (qpqConfig: QPQConfig): string => {
  const moduleName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return `${moduleName}::${randomUUID()}`;
};

export const createTestRuntime = <Story extends (...eventParams: any[]) => AskResponse<any>>(
  askStoryToRun: Story,
  mocks: QpqActionMock<any, string>[],
  options?: TestRuntimeOptions,
): TestRuntimeResult<Parameters<Story>> => {
  const qpqConfig = options?.qpqConfig || defaultQpqConfig;
  const storySession = options?.storySession || {
    depth: 0,
    context: {},
  };
  const ignoreBatch = !!options?.ignoreBatch;

  // Create a proxy that just resolves all actions to reading from the history
  var mockIndex = 0;
  const storyActionProcessor = new Proxy(
    {},
    {
      get: (target: any, property: any) => {
        return async (props: any) => {
          // console.log('object: ', target);
          // console.log('Type: ', property);
          // console.log('Input: ', JSON.stringify(props, null, 2));
          if (mockIndex >= mocks.length) {
            const [area, group, action] = property.split('/');
            const mock = `mockQpqAction(${group}ActionType.${action}, 'EXPECTED_VALUE_HERE', ` + JSON.stringify(props || '{}', null, 2) + ')';

            return actionResultError(ErrorTypeEnum.GenericError, `${property}: Mock Missing, add mock: [${mock}]`);
          }

          if (mocks[mockIndex].testInput) {
            if (!deepCompare(mocks[mockIndex].input, props)) {
              console.log(
                JSON.stringify(
                  {
                    expected: mocks[mockIndex].input,
                    received: props,
                  },
                  null,
                  2,
                ),
              );

              mockIndex = mockIndex + 1;
              return actionResultError(ErrorTypeEnum.GenericError, `${property}: Test Fail: Input is different to mock`);
            }
          }

          if (property !== mocks[mockIndex].type) {
            mockIndex = mockIndex + 1;

            console.log(JSON.stringify(props, null, 2));

            return actionResultError(ErrorTypeEnum.GenericError, `Invalid action Mock [${property}] - expected - [${mocks[mockIndex].type}]`);
          }

          const res = mocks[mockIndex].res;
          mockIndex = mockIndex + 1;
          return res;
        };
      },
    },
  );

  function* askRunWrapper(...args: any[]) {
    // console.log('HOOOKED!');
    return yield* askRemoveBatch(askStoryToRun(...args));
  }

  const runtime = getQpqRuntimeForStory(
    QpqRuntimeType.UNIT_TEST,
    qpqConfig,
    () => storySession,
    () => storyActionProcessor,
    getMockLogger,
    getRuntimeCorrelation,
    () => false,
    () => true,
    askRunWrapper,
  );

  const testApi: TestRuntimeResult<Parameters<Story>> = {
    execute: async (...inputParameters: Parameters<Story>) => {
      return runtime(...inputParameters);
    },
  };

  return testApi;
};
