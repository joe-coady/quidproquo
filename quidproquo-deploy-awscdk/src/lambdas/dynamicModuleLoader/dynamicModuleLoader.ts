// @ts-ignore - Special webpack loader
import qpqDynamicModuleLoader from 'qpq-dynamic-loader!';

import { serviceImporter } from 'quidproquo-webserver';

export const dynamicModuleLoader = async (modulePath: string): Promise<any> => {
  console.log(`Trying to load: ${modulePath}`);

  const module = await serviceImporter(modulePath);
  if (module) {
    console.log(`Service module found!`);
    return module;
  }

  console.log(`using qpqDynamicModuleLoader`);
  return qpqDynamicModuleLoader(modulePath);
};
