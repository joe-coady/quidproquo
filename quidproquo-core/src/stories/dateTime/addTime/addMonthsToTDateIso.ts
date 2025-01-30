export function addMonthsToTDateIso(startDate: string, numMonths: number): string {
  // Convert ISO string to Date object
  const nowDate = new Date(startDate);

  // add the days
  nowDate.setMonth(nowDate.getMonth() + numMonths);

  // Convert back to ISO string format
  const pastDateAsIsoString = nowDate.toISOString();

  // Return the ISO string for 7 days ago
  return pastDateAsIsoString;
}
