import { SendMessageBatchCommand, SendMessageBatchRequestEntry, SQSClient } from '@aws-sdk/client-sqs';

import { createAwsClient } from '../createAwsClient';
import { getQueueUrl } from './getQueueUrl';

export const sendMessages = async (queueName: string, region: string, messages: string[]): Promise<void> => {
  const sqsClient = createAwsClient(SQSClient, { region });

  const url = await getQueueUrl(queueName, sqsClient);

  // Convert them to entries
  const entries: SendMessageBatchRequestEntry[] = messages.map((message, index) => ({
    MessageBody: message,
    Id: `${index}`,
  }));

  // now send them off in batches of 10
  // We want to await incase of FIFO
  // If you don't care about order, you can split and askParallel outside of this

  while (entries.length > 0) {
    // Max batch size is 10
    const entriesBatch = entries.splice(0, 10);

    await sqsClient.send(
      new SendMessageBatchCommand({
        Entries: entriesBatch,
        QueueUrl: url,
      }),
    );
  }
};
