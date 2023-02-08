import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getQueueUrl } from './getQueueUrl';

export const sendMessage = async (
  queueName: string,
  region: string,
  message: any,
): Promise<void> => {
  const sqsClient = new SQSClient({
    region,
  });

  console.log(`[${queueName}] [${region}]`);
  try {
    await sqsClient.send(
      new SendMessageCommand({
        MessageBody: JSON.stringify(message),
        QueueUrl: await getQueueUrl(queueName, sqsClient),
      }),
    );
  } catch (e) {
    console.log('send message error!');
    console.log(e);
  }
};
