
import { QPQConfig } from 'quidproquo-core';

import {qpqCodeBucketName} from "./qpqCodeBucketName";
import { readTextFile } from '../s3/readTextFile';



export const  getModuleQpqConfig = async (): Promise<QPQConfig> => {
  const qpqConfigJson = await readTextFile(qpqCodeBucketName, 'qpqConfig.json', 'us-east-1' );

  return JSON.parse(qpqConfigJson);
};
