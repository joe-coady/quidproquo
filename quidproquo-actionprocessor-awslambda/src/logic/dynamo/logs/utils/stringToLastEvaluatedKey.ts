import { AttributeValue } from '@aws-sdk/client-dynamodb';

export function stringToLastEvaluatedKey(encodedKey: string): Record<string, AttributeValue> {
  return JSON.parse(Buffer.from(encodedKey, 'base64').toString());
}
