import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { ExtractActionType } from './ExtractActionType';

// extract document
type ExtractedExpenseDocument = {
  metadata: {
    merchantName?: string;
    merchantAddress?: string;
    date?: string;       // ISO 8601 preferred
    currency?: string;
    paymentMethod?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    [key: string]: any;  // future extensibility
  };

  lineItems?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
    [key: string]: any;  // for custom fields like SKU, discounts, etc.
  }>;

  rawText?: string;   // full OCR dump (if needed)
  source: {
    storageDrive: string;
    filePath: string;
    textractJobId?: string;
  };
  _raw?: any;  // Raw Textract response for debugging - should not be used in production
};

// Payload
export interface ExtractExpenseActionPayload {
  storageDriveName: string;
  filePath: string;
}

// Action
export interface ExtractExpenseAction extends Action<ExtractExpenseActionPayload> {
  type: ExtractActionType.Expense;
  payload: ExtractExpenseActionPayload;
}

// Function Types
export type ExtractExpenseActionProcessor = ActionProcessor<ExtractExpenseAction, ExtractedExpenseDocument>;
export type ExtractExpenseActionRequester = ActionRequester<ExtractExpenseAction, ExtractedExpenseDocument>;
