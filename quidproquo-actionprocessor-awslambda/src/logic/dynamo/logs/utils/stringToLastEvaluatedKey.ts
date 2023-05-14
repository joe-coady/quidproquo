export function stringToLastEvaluatedKey(encodedKey: string): any {
  return JSON.parse(Buffer.from(encodedKey, 'base64').toString());
}
