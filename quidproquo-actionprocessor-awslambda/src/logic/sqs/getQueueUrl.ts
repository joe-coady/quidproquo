import { GetQueueUrlCommand, SQSClient } from '@aws-sdk/client-sqs';

export const getQueueUrl = async (queueName: string, sqsClient: SQSClient): Promise<string> => {
  console.log('Getting url ', queueName);

  try {
    const response = await sqsClient.send(
      new GetQueueUrlCommand({
        QueueName: queueName,
      }),
    );

    console.log('got url: ', response.QueueUrl);

    return response.QueueUrl || '';
  } catch (e) {
    console.log('send GetQueueUrlCommand error!');
    console.log(e);

    return '';
  }
};
