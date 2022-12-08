import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'ap-southeast-2' });

export default s3Client;
