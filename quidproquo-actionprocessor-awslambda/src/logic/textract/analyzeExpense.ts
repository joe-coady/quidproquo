import { AnalyzeExpenseCommand,TextractClient } from '@aws-sdk/client-textract';

import { createAwsClient } from '../createAwsClient';

export interface TextractExpenseAnalysis {
  DocumentMetadata?: {
    Pages?: number;
  };
  ExpenseDocuments?: Array<{
    ExpenseIndex?: number;
    SummaryFields?: Array<{
      Type?: {
        Text?: string;
        Confidence?: number;
      };
      ValueDetection?: {
        Text?: string;
        Confidence?: number;
      };
      LabelDetection?: {
        Text?: string;
        Confidence?: number;
      };
      PageNumber?: number;
    }>;
    LineItemGroups?: Array<{
      LineItemGroupIndex?: number;
      LineItems?: Array<{
        LineItemExpenseFields?: Array<{
          Type?: {
            Text?: string;
            Confidence?: number;
          };
          ValueDetection?: {
            Text?: string;
            Confidence?: number;
          };
          LabelDetection?: {
            Text?: string;
            Confidence?: number;
          };
          PageNumber?: number;
        }>;
      }>;
    }>;
    Blocks?: Array<{
      BlockType?: string;
      Text?: string;
      Confidence?: number;
      Page?: number;
      Id?: string;
    }>;
  }>;
}

export const analyzeExpenseDocument = async (
  bucketName: string,
  documentKey: string,
  region: string
): Promise<TextractExpenseAnalysis> => {
  const textractClient = createAwsClient(TextractClient, { region });

  const command = new AnalyzeExpenseCommand({
    Document: {
      S3Object: {
        Bucket: bucketName,
        Name: documentKey,
      },
    },
  });

  const response = await textractClient.send(command);

  return {
    DocumentMetadata: response.DocumentMetadata,
    ExpenseDocuments: response.ExpenseDocuments,
  };
};