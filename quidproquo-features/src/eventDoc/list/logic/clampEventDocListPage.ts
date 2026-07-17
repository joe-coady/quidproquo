// Clamp a requested page into the valid range for the given item count and
// page size. An empty list still has one (empty) page, so the result is
// always >= 1.
export const clampEventDocListPage = (page: number, itemCount: number, pageSize: number): number => {
  const pageCount = Math.max(1, Math.ceil(itemCount / Math.max(1, pageSize)));

  return Math.min(Math.max(1, page), pageCount);
};
