export const executeServiceFunctionExecuteEvent = async (...args: any[]) => {
  return {
    someObject: 'hello world ' + JSON.stringify(args, null, 2),
  };
};
