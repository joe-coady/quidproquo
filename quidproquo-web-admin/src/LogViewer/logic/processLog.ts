export const processLog = (logFile: any) => {
  if (!logFile) {
    return [];
  }

  console.log(logFile);

  const firstEvent = {
    dateTime: logFile.startedAt,
    title: `${logFile.runtimeType} - ${logFile.moduleName}`,
    subText: logFile.tags.join(','),
    key: logFile.id,
  };

  const secondEvent = {
    dateTime: logFile.startedAt,
    title: 'Executed with input params of',
    subText: JSON.stringify(logFile.input, null, 1),
    key: logFile.id + 'part_2',
  };

  const finalEvent = {
    dateTime: logFile.finishedAt,
    title: logFile.error ? 'Thrown Error' : 'Returned',
    subText: logFile.error
      ? JSON.stringify(logFile.error, null, 1)
      : JSON.stringify(logFile.result, null, 1),
    key: logFile.id + 'return',
  };

  const history = logFile.history.map((h: any, i: number) => {
    const message = {
      subText: `${h.act.payload ? `Input: ${JSON.stringify(h.act.payload, null, 2)}\n` : ''}${
        h.res ? `Output: ${JSON.stringify(h.res, null, 2)}` : ''
      }`,
      title: h.act.type.split('/').slice(-2).join('::'),
      key: logFile.id + i,
      dateTime: h.startedAt,
      timeMs: new Date(h.finishedAt).getTime() - new Date(h.startedAt).getTime(),
    };
    return message;
  });

  return [firstEvent, secondEvent, ...history, finalEvent];
};
