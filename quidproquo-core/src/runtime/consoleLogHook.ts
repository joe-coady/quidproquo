import { qpqConsoleLog } from '../types';

const subscriptions: qpqConsoleLog[][] = [];

const oldConsoleLog = console.log;
console.log = (...args: any[]) => {
  const logEntry: qpqConsoleLog = { t: new Date().toISOString(), a: args };

  for (const sub of subscriptions) {
    sub.push(logEntry);
  }

  return oldConsoleLog(...args);
};

export function subscribeToConsoleLogs(consoleLogArray: qpqConsoleLog[]): void {
  subscriptions.push(consoleLogArray);
}

export function unsubscribeFromConsoleLogs(consoleLogArray: qpqConsoleLog[]): void {
  const subIndex = subscriptions.findIndex((s) => s === consoleLogArray);
  if (subIndex >= 0) {
    subscriptions.splice(subIndex, 1);
  }
}
