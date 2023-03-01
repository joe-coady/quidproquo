import {
  PublishBatchCommand,
  PublishBatchCommandInput,
  SNSClient,
  PublishBatchRequestEntry,
} from '@aws-sdk/client-sns';

export const publishMessage = async (
  topicArn: string,
  region: string,
  messages: string[],
): Promise<void> => {
  const sqsClient = new SNSClient({
    region,
  });

  // Convert them to entries
  const entries: PublishBatchRequestEntry[] = messages.map((message, index) => ({
    Message: message,
    Id: `${index}`,
    // MessageAttributes: {
    //   type: {
    //     DataType: 'String',
    //     StringValue: JSON.parse(message).type,
    //   },
    // },
  }));

  // now send them off in batches of 10
  // We want to await incase of FIFO
  // If you don't care about order, you can split and askParallel outside of this

  while (entries.length > 0) {
    // Not sure the max batch size, although the entire payload cant be bigger then 256 KB
    // TODO: So maybe we should split based on payload sizes
    const entriesBatch = entries.splice(0, 10);

    await sqsClient.send(
      new PublishBatchCommand({
        TopicArn: topicArn,
        PublishBatchRequestEntries: entriesBatch,
      }),
    );
  }
};
