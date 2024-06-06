import { init, loadRemote } from '@module-federation/enhanced/runtime';
import { qpqCodeBucketName } from "./qpqCodeBucketName";

init({
  name: '@demo/main-app',
  remotes: [
    {
      name: '@demo/app2',
      alias: 'app2',
      entry: `https://${qpqCodeBucketName}.s3.us-east-1.amazonaws.com/remoteEntry.js`,
    },
  ],
});

export const dynamicModuleLoader = async (modulePath: string): Promise<any> => {
  try {  
    const module = await loadRemote('app2/entry_controller_favoriteModelController');
    return module;
  } catch (e) {
    console.log("Unable to load module", e);
    return null;
  }  
};
