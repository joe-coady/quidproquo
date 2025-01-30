export function addDaysToTDateIso(startDate: string, numDays: number): string {
  // Convert ISO string to Date object
  const nowDate = new Date(startDate);

  // add the days
  nowDate.setDate(nowDate.getDate() + numDays);

  // Convert back to ISO string format
  const pastDateAsIsoString = nowDate.toISOString();

  // Return the ISO string for 7 days ago
  return pastDateAsIsoString;
}
