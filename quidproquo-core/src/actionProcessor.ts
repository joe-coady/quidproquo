import SystemActionTypeEnum from "./actions/system/SystemActionTypeEnum";

async function processAction(action: any, actionProcessors: any, session: any) {
  // Special action ~ batch - needs access to the processAction / actionProcessor context
  if (action.type === SystemActionTypeEnum.Batch) {
    return await Promise.all(
      action.payload.actions.map((a: any) => {
        return a ? processAction(a, actionProcessors, session) : null;
      })
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
  actionProcessors: any
) {
  const reader = story(...args);

  const history: Array<any> = [];
  let action = null;

  const response = {
    input: args,
    session,
    history,
    result: null,
    error: null,
    errorTrace: null,
  };

  try {
    action = reader.next();

    while (!action.done) {
      const actionResult: any = await processAction(
        action.value,
        actionProcessors,
        session
      );
      history.push({
        act: action.value,
        res: actionResult,
      });

      action = reader.next(actionResult);
    }
  } catch (err) {
    console.log("story Error: ", err);

    if (err instanceof Error) {
      return {
        ...response,
        error: err.message.toString(),
      };
    }
    return {
      ...response,
      error: "unknown error has occurred",
    };
  }

  return {
    ...response,
    result: action.value,
  };
}
