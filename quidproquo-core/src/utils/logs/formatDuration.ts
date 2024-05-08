export function formatDuration(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1); // Keep one decimal place

  const minutesPart = minutes > 0 ? `${minutes}m ` : '';
  const secondsPart = `${seconds}s`;

  return `${minutesPart}${secondsPart}`.trim();
}
