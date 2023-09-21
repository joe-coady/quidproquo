import { S3Event, S3Handler } from 'aws-lambda';

export const executeS3FileEvent: S3Handler = async (event: S3Event) => {
  console.log("s3 event: ", JSON.stringify(event, null, 2));

};
