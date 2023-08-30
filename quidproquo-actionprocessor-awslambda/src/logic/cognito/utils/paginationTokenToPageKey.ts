export function paginationTokenToPageKey(paginationToken?: string): string | undefined {
  if (!paginationToken) {
    return undefined;
  }
  return Buffer.from(paginationToken).toString('base64');
}
