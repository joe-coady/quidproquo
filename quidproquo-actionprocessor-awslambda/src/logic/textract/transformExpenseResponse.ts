import { TextractExpenseAnalysis } from './analyzeExpense';

export interface ExtractedExpenseDocument {
  metadata: {
    merchantName?: string;
    merchantAddress?: string;
    date?: string;
    currency?: string;
    paymentMethod?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    [key: string]: any;
  };
  lineItems?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
    [key: string]: any;
  }>;
  rawText?: string;
  source: {
    storageDrive: string;
    filePath: string;
    textractJobId?: string;
  };
  _raw?: any;
}

const FIELD_TYPE_MAPPINGS: Record<string, string> = {
  'VENDOR_NAME': 'merchantName',
  'NAME': 'merchantName',
  'MERCHANT_NAME': 'merchantName',
  'VENDOR_ADDRESS': 'merchantAddress',
  'ADDRESS': 'merchantAddress',
  'MERCHANT_ADDRESS': 'merchantAddress',
  'INVOICE_RECEIPT_DATE': 'date',
  'DATE': 'date',
  'CURRENCY_CODE': 'currency',
  'PAYMENT_METHOD': 'paymentMethod',
  'SUBTOTAL': 'subtotal',
  'TAX': 'tax',
  'TOTAL': 'total',
  'AMOUNT_DUE': 'total',
  'AMOUNT_PAID': 'amountPaid',
  'INVOICE_RECEIPT_ID': 'receiptNumber',
  'INVOICE_ID': 'invoiceNumber',
  'RECEIPT_ID': 'receiptNumber',
  'TAX_PAYER_ID': 'taxId',
  'VENDOR_ABN_NUMBER': 'vendorAbn',
  'VENDOR_PHONE': 'vendorPhone', 
  'VENDOR_URL': 'vendorUrl',
};

const LINE_ITEM_FIELD_MAPPINGS: Record<string, string> = {
  'ITEM': 'description',
  'DESCRIPTION': 'description',
  'PRODUCT_NAME': 'description',
  'QUANTITY': 'quantity',
  'UNIT_PRICE': 'unitPrice',
  'PRICE': 'total',
  'AMOUNT': 'total',
};

function extractFieldValue(field: any, forceString: boolean = false): string | number | undefined {
  const text = field?.ValueDetection?.Text || field?.Type?.Text;
  if (!text) return undefined;
  
  // For certain fields, always return as string (dates, IDs, etc.)
  if (forceString) return text;
  
  // Only try to parse as number if it looks like a price/amount (has $ or is purely numeric)
  const cleanedText = text.replace(/[$,]/g, '').trim();
  
  // Check if it's a pure number or price
  if (/^\d+\.?\d*$/.test(cleanedText) && !text.includes('/') && !text.includes('-')) {
    const numericValue = parseFloat(cleanedText);
    if (!isNaN(numericValue)) return numericValue;
  }
  
  return text;
}

function extractSummaryFields(summaryFields?: Array<any>): Record<string, any> {
  const metadata: Record<string, any> = {};
  
  if (!summaryFields) return metadata;
  
  // Fields that should always be strings
  const stringFields = new Set([
    'DATE', 'INVOICE_RECEIPT_DATE', 'CURRENCY_CODE', 'PAYMENT_METHOD',
    'INVOICE_RECEIPT_ID', 'INVOICE_ID', 'RECEIPT_ID', 'TAX_PAYER_ID',
    'VENDOR_ABN_NUMBER', 'VENDOR_PHONE', 'VENDOR_URL'
  ]);
  
  // Track confidence scores for duplicate fields
  const fieldConfidence: Record<string, number> = {};
  
  for (const field of summaryFields) {
    const fieldType = field?.Type?.Text?.toUpperCase();
    if (!fieldType) continue;
    
    const confidence = field?.Type?.Confidence || 0;
    const forceString = stringFields.has(fieldType) || fieldType.includes('DATE') || fieldType.includes('ID') || fieldType.includes('NUMBER') || fieldType.includes('PHONE') || fieldType.includes('URL');
    
    if (FIELD_TYPE_MAPPINGS[fieldType]) {
      const mappedKey = FIELD_TYPE_MAPPINGS[fieldType];
      const value = extractFieldValue(field, forceString);
      
      // Only update if value exists and has higher confidence than existing
      if (value !== undefined) {
        const existingConfidence = fieldConfidence[mappedKey] || 0;
        if (confidence > existingConfidence) {
          metadata[mappedKey] = value;
          fieldConfidence[mappedKey] = confidence;
        }
      }
    } else {
      // Skip fields that are clearly not useful
      const fieldKey = fieldType.toLowerCase().replace(/_/g, '');
      
      // Skip certain field types that aren't useful in our structure
      if (['street', 'city', 'addressblock', 'expenserow', 'other'].includes(fieldKey)) {
        continue;
      }
      
      // Store other unmapped fields for extensibility
      const value = extractFieldValue(field, forceString);
      if (value !== undefined && !fieldKey.startsWith('vendor_') && !fieldKey.startsWith('amount_')) {
        // Use more readable field names
        const cleanKey = fieldType.toLowerCase().replace(/_/g, '');
        metadata[cleanKey] = value;
      }
    }
  }
  
  // Clean up merchant name - take the first line if multiline
  if (metadata.merchantName && metadata.merchantName.includes('\n')) {
    metadata.merchantName = metadata.merchantName.split('\n')[0].trim();
  }
  
  return metadata;
}

function extractLineItems(lineItemGroups?: Array<any>): Array<any> | undefined {
  if (!lineItemGroups || lineItemGroups.length === 0) return undefined;
  
  const items: Array<any> = [];
  
  for (const group of lineItemGroups) {
    if (!group.LineItems) continue;
    
    for (const lineItem of group.LineItems) {
      if (!lineItem.LineItemExpenseFields) continue;
      
      const item: Record<string, any> = { description: '' };
      
      for (const field of lineItem.LineItemExpenseFields) {
        const fieldType = field?.Type?.Text?.toUpperCase();
        if (!fieldType) continue;
        
        // Determine if this field should be a string
        const forceString = fieldType === 'ITEM' || fieldType === 'DESCRIPTION' || fieldType === 'PRODUCT_NAME';
        
        if (LINE_ITEM_FIELD_MAPPINGS[fieldType]) {
          const mappedKey = LINE_ITEM_FIELD_MAPPINGS[fieldType];
          const value = extractFieldValue(field, forceString);
          if (value !== undefined) {
            item[mappedKey] = value;
          }
        } else if (fieldType !== 'EXPENSE_ROW') {
          // Store unmapped fields except expense_row which is just raw text
          const value = extractFieldValue(field, forceString);
          if (value !== undefined) {
            const cleanKey = fieldType.toLowerCase().replace(/_/g, '');
            item[cleanKey] = value;
          }
        }
      }
      
      // Only add if we have at least a description or some meaningful data
      if (item.description || (Object.keys(item).length > 1 && (item.total || item.quantity))) {
        items.push(item);
      }
    }
  }
  
  return items.length > 0 ? items : undefined;
}

function extractRawText(blocks?: Array<any>): string | undefined {
  if (!blocks) return undefined;
  
  const textBlocks = blocks
    .filter(block => block.BlockType === 'LINE' && block.Text)
    .map(block => block.Text)
    .join('\n');
  
  return textBlocks || undefined;
}

export function transformTextractExpenseResponse(
  textractResponse: TextractExpenseAnalysis,
  storageDrive: string,
  filePath: string,
  includeRaw: boolean = true
): ExtractedExpenseDocument {
  // Process the first expense document (most receipts/invoices have just one)
  const expenseDoc = textractResponse.ExpenseDocuments?.[0];
  
  const metadata = extractSummaryFields(expenseDoc?.SummaryFields);
  const lineItems = extractLineItems(expenseDoc?.LineItemGroups);
  const rawText = extractRawText(expenseDoc?.Blocks);
  
  const result: ExtractedExpenseDocument = {
    metadata,
    lineItems,
    rawText,
    source: {
      storageDrive: storageDrive,
      filePath: filePath,
    },
  };

  // Include raw response for debugging (can be disabled in production)
  if (includeRaw) {
    result._raw = textractResponse;
  }

  return result;
}