export function pageKeyToPaginationToken(pageKey?: string): string | undefined {
  if (!pageKey) {
    return undefined;
  }

  return Buffer.from(pageKey, 'base64').toString();
}
