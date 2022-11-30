import SystemActionTypeEnum from './actions/system/SystemActionTypeEnum';

async function processAction(action: any, actionProcessors: any, session: any) {
  // Special action ~ batch - needs access to the processAction / actionProcessor context
  if (action.type === SystemActionTypeEnum.Batch) {
    return await Promise.all(
      action.payload.actions.map((a: any) => {
        return a ? processAction(a, actionProcessors, session) : null;
      }),
    );
  }

  const processor = actionProcessors?.[action?.type];
  if (!processor) {
    return;
  }

  return await processor(action.payload, session);
}

export async function resolveStory(
  story: any,
  args: Array<any>,
  session: any,
  actionProcessors: any,
  resolveNow: any,
  logger: any,
  newGuid: any,
) {
  const reader = story(...args);

  const history: Array<any> = [];
  let action = null;

  const response = {
    input: args,
    session,
    history,
    startedAt: resolveNow(),
    result: null,
    error: null,
    errorTrace: null,
    fromCorrelation: session.correlation,
    correlation: newGuid(),
  };

  const newSession = {
    ...session,
  };

  try {
    action = reader.next();

    while (!action.done) {
      const executionTime = resolveNow();
      const actionResult: any = await processAction(action.value, actionProcessors, session);
      history.push({
        act: action.value,
        res: actionResult,
        startedAt: executionTime,
        finishedAt: resolveNow(),
      });

      action = reader.next(actionResult);
    }
  } catch (err) {
    console.log('story Error: ', err);

    if (err instanceof Error) {
      return {
        ...response,
        error: err.message.toString(),
      };
    }
    return {
      ...response,
      error: 'unknown error has occurred',
    };
  }

  const storyResult = {
    ...response,
    finishedAt: resolveNow(),
    result: action.value,
  };

  await logger(storyResult);

  return storyResult;
}
