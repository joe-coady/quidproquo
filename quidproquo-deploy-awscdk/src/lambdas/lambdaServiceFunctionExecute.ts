export const executeServiceFunctionExecuteEvent = async (...args: any[]) => {
  return 'hello world ' + JSON.stringify(args, null, 2);
};
