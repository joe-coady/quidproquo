export function addDayMonthYearToTDateIso(startDate: string, numDays: number, numMonths: number, numYears: number): string {
  // Convert ISO string to Date object
  const nowDate = new Date(startDate);

  nowDate.setDate(nowDate.getDate() + numDays);
  nowDate.setMonth(nowDate.getMonth() + numMonths);
  nowDate.setFullYear(nowDate.getFullYear() + numYears);

  // Convert back to ISO string format
  const pastDateAsIsoString = nowDate.toISOString();

  // Return the ISO string for 7 days ago
  return pastDateAsIsoString;
}
