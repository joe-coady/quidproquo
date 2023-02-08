import { SendMessageCommand, SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getQueueUrl } from './getQueueUrl';

export const sendMessage = async (
  queueName: string,
  region: string,
  message: string,
): Promise<void> => {
  const sqsClient = new SQSClient({
    region,
  });

  await sqsClient.send(
    new SendMessageCommand({
      MessageBody: message,
      QueueUrl: await getQueueUrl(queueName, sqsClient),
    }),
  );
};
