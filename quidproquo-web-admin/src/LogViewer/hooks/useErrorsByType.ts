import { useMemo } from 'react';

export const useErrorsByType = (logs: any[]) => {
const data = useMemo(() => {
const errorCounts: Record<string, number> = {};

logs.forEach((log) => {
if (log.error) {
errorCounts[log.error] = (errorCounts[log.error] || 0) + 1;
}
});

return Object.entries(errorCounts).map(([errorType, count]) => ({
errorType,
count,
}));
}, [logs]);

return data;
};