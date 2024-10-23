import { ACMClient, ListCertificatesCommand } from '@aws-sdk/client-acm';

import { createAwsClient } from '../createAwsClient';

export const findMatchingCertificates = async (
  domainName: string,
  region: string,
  retryCount: number = 3,
  delayMs: number = 5000,
): Promise<string[]> => {
  const lowerCaseDomainName = domainName.toLowerCase();
  const acmClient = createAwsClient(ACMClient, {
    region,
  });

  let remainingRetries = retryCount;

  while (remainingRetries > 0) {
    let certificateArns: string[] = [];
    let NextToken: string | undefined;

    do {
      const listCommand = new ListCertificatesCommand({
        NextToken,
      });

      const listResult = await acmClient.send(listCommand);

      for (const certificate of listResult.CertificateSummaryList || []) {
        if (certificate.CertificateArn && certificate.DomainName?.toLowerCase() === lowerCaseDomainName) {
          certificateArns.push(certificate.CertificateArn);
        }
      }

      NextToken = listResult.NextToken;
    } while (NextToken);

    if (certificateArns.length > 0) {
      return certificateArns;
    }

    remainingRetries--;

    if (remainingRetries != 0) {
      // Don't wait after the last try
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  return []; // Return an empty array after max retries
};

// (async () => {
//   const matchingCerts = await findMatchingCertificates('example.com', 'us-east-1');
//   console.log('Matching certificates:', matchingCerts);
// })();
