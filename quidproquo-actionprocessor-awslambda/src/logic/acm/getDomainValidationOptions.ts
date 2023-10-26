import { ACMClient, DescribeCertificateCommand } from '@aws-sdk/client-acm';
import { createAwsClient } from '../createAwsClient';

import { CloudFlareDnsEntries } from 'quidproquo-webserver';

export const getDomainValidationOptions = async (
  certificateArn: string,
  region: string,
): Promise<CloudFlareDnsEntries> => {
  const acmClient = createAwsClient(ACMClient, {
    region,
  });

  const command = new DescribeCertificateCommand({
    CertificateArn: certificateArn,
  });

  const result = await acmClient.send(command);

  const entries: CloudFlareDnsEntries = {};

  console.log('DescribeCertificateCommand: ', JSON.stringify(result, null, 2));

  // Extract the DomainValidationOptions and populate the entries
  if (result.Certificate && result.Certificate.DomainValidationOptions) {
    for (const option of result.Certificate.DomainValidationOptions) {
      if (option.ResourceRecord?.Name && option.ResourceRecord?.Value) {
        entries[option.ResourceRecord.Name] = {
          proxied: false,
          type: 'CNAME',
          value: option.ResourceRecord.Value,
        };
      }
    }
  }

  return entries;
};
