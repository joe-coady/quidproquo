export const filterLogs = (filter: string, logs: any[]): any[] => {
  if (!filter) {
    return logs;
  }

  const filterWords = filter.trim().toLowerCase().split(' ');
  return logs.filter((log: any) => {
    const lowerLogError = (log.error || '').toLowerCase();
    return filterWords.every((word) => lowerLogError && lowerLogError.includes(word));
  });
};
