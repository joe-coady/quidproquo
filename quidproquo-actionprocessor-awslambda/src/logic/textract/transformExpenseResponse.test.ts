import { describe, expect, it } from 'vitest';

import { transformTextractExpenseResponse } from './transformExpenseResponse';

const response = {
  ExpenseDocuments: [
    {
      SummaryFields: [
        { Type: { Text: 'TOTAL', Confidence: 99 }, ValueDetection: { Text: '$42.50' } },
        { Type: { Text: 'VENDOR_NAME', Confidence: 90 }, ValueDetection: { Text: 'Acme\nInc' } },
        { Type: { Text: 'INVOICE_RECEIPT_DATE', Confidence: 90 }, ValueDetection: { Text: '2026-01-01' } },
      ],
      LineItemGroups: [
        {
          LineItems: [
            {
              LineItemExpenseFields: [
                { Type: { Text: 'ITEM' }, ValueDetection: { Text: 'Widget' } },
                { Type: { Text: 'PRICE' }, ValueDetection: { Text: '$10.00' } },
              ],
            },
          ],
        },
      ],
      Blocks: [
        { BlockType: 'LINE', Text: 'Line one' },
        { BlockType: 'WORD', Text: 'ignored' },
      ],
    },
  ],
} as any;

describe('transformTextractExpenseResponse', () => {
  it('maps summary fields to typed metadata, parsing amounts and keeping dates as strings', () => {
    const result = transformTextractExpenseResponse(response, 'drive', 'path/to/file');

    expect(result.metadata).toEqual({ total: 42.5, merchantName: 'Acme', date: '2026-01-01' });
  });

  it('extracts line items via the field mappings', () => {
    const result = transformTextractExpenseResponse(response, 'drive', 'path/to/file');

    expect(result.lineItems).toEqual([{ description: 'Widget', total: 10 }]);
  });

  it('joins LINE blocks into raw text and records the source', () => {
    const result = transformTextractExpenseResponse(response, 'drive', 'path/to/file');

    expect(result.rawText).toBe('Line one');
    expect(result.source).toEqual({ storageDrive: 'drive', filePath: 'path/to/file' });
  });

  it('includes the raw response by default and omits it when disabled', () => {
    expect(transformTextractExpenseResponse(response, 'drive', 'path')._raw).toBe(response);
    expect(transformTextractExpenseResponse(response, 'drive', 'path', false)._raw).toBeUndefined();
  });

  it('returns empty metadata and no line items for a document with no fields', () => {
    const result = transformTextractExpenseResponse({ ExpenseDocuments: [] } as any, 'drive', 'path');

    expect(result.metadata).toEqual({});
    expect(result.lineItems).toBeUndefined();
    expect(result.rawText).toBeUndefined();
  });
});
