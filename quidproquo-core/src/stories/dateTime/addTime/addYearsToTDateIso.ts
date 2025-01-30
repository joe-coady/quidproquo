export function addYearsToTDateIso(startDate: string, numYears: number): string {
  // Convert ISO string to Date object
  const nowDate = new Date(startDate);

  // add the days
  nowDate.setFullYear(nowDate.getFullYear() + numYears);

  // Convert back to ISO string format
  const pastDateAsIsoString = nowDate.toISOString();

  // Return the ISO string for 7 days ago
  return pastDateAsIsoString;
}
