import { StoryResult } from 'quidproquo-core';

export const processLog = (logFile: StoryResult<any>) => {
  if (!logFile) {
    return [];
  }

  const firstEvent = {
    dateTime: logFile.startedAt,
    title: `${logFile.runtimeType} - ${logFile.moduleName}`,
    subText: `${logFile.tags.join(',')}${
      logFile.fromCorrelation ? '\r\n\r\nCaller: ' + logFile.fromCorrelation : ''
    }`,
    key: logFile.correlation + 'part_1',
  };

  const secondEvent = {
    dateTime: logFile.startedAt,
    title: 'Executed with input params of',
    subText: JSON.stringify(logFile.input, null, 2),
    key: logFile.correlation + 'part_2',
  };

  const finalEvent = {
    dateTime: logFile.finishedAt,
    title: logFile.error ? 'Thrown Error' : 'Returned',
    subText: logFile.error
      ? JSON.stringify(logFile.error, null, 2)
      : JSON.stringify(logFile.result, null, 2),
    key: logFile.correlation + 'final',
  };

  const history = logFile.history.map((h: any, i: number) => ({
    subText: `${h.act.payload ? `Input: ${JSON.stringify(h.act.payload, null, 2)}\n` : ''}${
      h.res ? `Output: ${JSON.stringify(h.res, null, 2)}` : ''
    }`,
    title: h.act.type.split('/').slice(-2).join('::'),
    key: logFile.correlation + i,
    dateTime: h.startedAt,
    timeMs: new Date(h.finishedAt).getTime() - new Date(h.startedAt).getTime(),
  }));

  return [firstEvent, secondEvent, ...history, finalEvent];
};
