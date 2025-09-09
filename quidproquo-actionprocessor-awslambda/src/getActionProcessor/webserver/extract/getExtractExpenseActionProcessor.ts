import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { ExtractActionType, ExtractExpenseActionProcessor, ExtractExpenseErrorTypeEnum } from 'quidproquo-webserver';

import { getConfigRuntimeResourceNameFromConfigWithServiceOverride } from '../../../awsNamingUtils';
import { analyzeExpenseDocument, transformTextractExpenseResponse } from '../../../logic/textract';

const resolveStorageDriveBucketName = (drive: string, qpqConfig: QPQConfig) => {
  const storageDriveConfig = qpqCoreUtils.getStorageDriveByName(drive, qpqConfig);

  if (!storageDriveConfig) {
    throw new Error(`Could not find storage drive config for [${drive}]`);
  }

  return getConfigRuntimeResourceNameFromConfigWithServiceOverride(
    storageDriveConfig.owner?.resourceNameOverride || drive,
    qpqConfig,
    storageDriveConfig.owner?.module,
  );
};

const getProcessExtractExpense = (qpqConfig: QPQConfig): ExtractExpenseActionProcessor => {
  return async ({ storageDriveName, filePath }) => {
    try {
      const bucketName = resolveStorageDriveBucketName(storageDriveName, qpqConfig);
      const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

      // Call Textract to analyze the expense document
      const textractResponse = await analyzeExpenseDocument(bucketName, filePath, region);

      // Transform the response to our format
      const extractedDocument = transformTextractExpenseResponse(
        textractResponse,
        storageDriveName,
        filePath,
        true
      );

      return actionResult(extractedDocument);
    } catch (error: unknown) {
      // Handle specific AWS errors with proper error mapping
      return actionResultErrorFromCaughtError(error, {
        InvalidS3ObjectException: () => actionResultError(ExtractExpenseErrorTypeEnum.FileNotFound, 'The specified file could not be found or accessed'),
        NoSuchKey: () => actionResultError(ExtractExpenseErrorTypeEnum.FileNotFound, 'The specified file does not exist'),
        UnsupportedDocumentException: () => actionResultError(ExtractExpenseErrorTypeEnum.UnsupportedFormat, 'The document format is not supported for expense analysis'),
        InvalidParameterException: () => actionResultError(ExtractExpenseErrorTypeEnum.InvalidParameter, 'Invalid parameters provided to the extraction service'),
        ThrottlingException: () => actionResultError(ExtractExpenseErrorTypeEnum.RateLimited, 'Too many requests, please try again later'),
        InvalidObjectState: () => actionResultError(ExtractExpenseErrorTypeEnum.InvalidStorageClass, 'File is in the wrong storage class'),
        AccessDenied: () => actionResultError(ExtractExpenseErrorTypeEnum.AccessDenied, 'Access denied to the specified file'),
      });
    }
  };
};

export const getExtractExpenseActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig
): Promise<ActionProcessorList> => ({
  [ExtractActionType.Expense]: getProcessExtractExpense(qpqConfig),
});