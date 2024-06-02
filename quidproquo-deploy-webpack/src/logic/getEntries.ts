import path from 'path';

import {QPQConfig, qpqCoreUtils} from "quidproquo-core";
import { qpqWebServerUtils } from 'quidproquo-webserver';

export const getEntries = (qpqConfig: QPQConfig) => {
    const srcEntries = [...qpqCoreUtils.getAllSrcEntries(qpqConfig), ...qpqWebServerUtils.getAllSrcEntries(qpqConfig)];
    const srcEntriesWithNoQpqCode = srcEntries.filter(se => !se.includes('@QpqService'));

    const entries = srcEntriesWithNoQpqCode.reduce((acc, srcPath) => {
        const uniqueName = srcPath.replace(/\//g, '_');
        acc[uniqueName] = path.resolve(qpqCoreUtils.getConfigRoot(qpqConfig), srcPath);
        return acc;
    }, {} as Record<string, string>);

    return entries;
};