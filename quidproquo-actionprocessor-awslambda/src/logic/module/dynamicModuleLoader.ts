
import { serviceImporter } from 'quidproquo-webserver';
import { qpqCodeBucketName } from "./qpqCodeBucketName";

import { readTextFile } from '../s3/readTextFile';

export const dynamicModuleLoader = async (modulePath: string): Promise<any> => {
  try {
    console.log(`Trying to load: ${modulePath}`);

    const module = await serviceImporter(modulePath);
    if (module) {
      console.log(`Service module found!`);
      return module;
    }
  
    console.log(`using qpqDynamicModuleLoader`);
  
    console.log("bucketName: ", qpqCodeBucketName);
  
    const uniqueName = modulePath.replace(/\//g, '_');
  
    console.log('unique name: ', uniqueName);
  
    const srcData = await readTextFile(qpqCodeBucketName, `${uniqueName}.js`, 'us-east-1' );  
  
    console.log("src", srcData);
  
    const evaledModule = new Function('return ' + srcData)();
  
    console.log("after eval");
  
    return evaledModule;
  } catch (e) {
    console.log("Unable to load module", e);
    return null;
  }  
};
