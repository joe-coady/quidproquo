import { askProcessEvent, QPQConfig, qpqCoreUtils, qpqExecuteLog, QpqFunctionRuntime, QpqRuntimeType, StoryResult } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import bodyParser from 'body-parser';
import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

import { getExpressApiEventEventProcessor } from '../actionProcessor';
import { getAllServiceConfigs } from '../allServiceConfig';
import { DevServerConfig, ExpressEvent, ExpressEventResponse } from '../types';
import { processEvent } from './apiRuntime';

const getServiceBaseDomain = (qpqConfig: QPQConfig, devServerConfig: DevServerConfig) =>
  qpqWebServerUtils.getDomainRoot(
    `${devServerConfig.serverDomain}:${devServerConfig.serverPort}`,
    qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
    qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
  );

const getApiDomainsFromConfig = (qpqConfig: QPQConfig, devServerConfig: DevServerConfig) => {
  const baseDomain = getServiceBaseDomain(qpqConfig, devServerConfig);

  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  // Get apis
  const apiConfigs = qpqWebServerUtils.getApiConfigs(qpqConfig);

  const apiDomains = apiConfigs.map((apiConfig) => ({
    apiName: apiConfig.apiName,
    service: serviceName,
    qpqConfig,
    domain: `${apiConfig.apiSubdomain}.${baseDomain}`,
    devDomain: baseDomain,
    devPath: `/${apiConfig.apiSubdomain}/${serviceName}`,
  }));

  return apiDomains;
};

const getDynamicModuleLoader = (qpqConfig: QPQConfig, devServerConfig: DevServerConfig) => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return async (runtime: QpqFunctionRuntime): Promise<any> => devServerConfig.dynamicModuleLoader(serviceName, runtime);
};

export const apiRuntime = async (devServerConfig: DevServerConfig) => {
  const allServiceConfig = await getAllServiceConfigs(devServerConfig);

  const app: Express = express();

  app.use(multer().any());

  app.use(bodyParser.json({ limit: '50mb' }));

  const apiConfigs = allServiceConfig.map((qpqConfig) => getApiDomainsFromConfig(qpqConfig, devServerConfig)).flat();

  const adminFrontend = path.join(__dirname, '../../..', 'node_modules', 'quidproquo-web-admin', 'lib');

  // Admin page
  app.use('/admin', express.static(adminFrontend));
  app.get('/admin/service/log/list', (req, res) => {
    // Manually set CORS headers
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'false');

    const serviceList = allServiceConfig.map((qpqConfig) => qpqCoreUtils.getApplicationModuleName(qpqConfig)).map((name) => `api/${name}`);

    res.json(serviceList);
  });

  app.use(express.json());

  app.options('/admin/service/log/execute', async (req, res) => {
    // Manually set CORS headers
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'false');

    res.json({ done: true });
  });

  app.get('/mf-manifest-location.json', async (req, res) => {
    // Manually set CORS headers
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'false');

    res.json({ location: 'http://localhost:3005/mf-manifest.json' });
  });

  app.post('/admin/service/log/execute', async (req, res) => {
    // Manually set CORS headers
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'false');

    // TODO: Get list of services from config dynamically
    const serviceLog: StoryResult<any> = req.body;

    let runtimeModule = askProcessEvent;

    if (serviceLog.runtimeType === QpqRuntimeType.EXECUTE_STORY) {
      const [srcEntry, module] = serviceLog.tags[0].split('::');

      const loadedModule = await devServerConfig.dynamicModuleLoader(serviceLog.moduleName, srcEntry as QpqFunctionRuntime);

      runtimeModule = loadedModule[module];
    }

    const result = await qpqExecuteLog(serviceLog, runtimeModule);
    res.json(result);
  });

  // Proxy for all services
  app.all('*', async (req: Request | any, res: Response) => {
    const apiConfig = apiConfigs.find((c) => req.url.startsWith(`${c.devPath}/`));

    if (apiConfig) {
      console.log(`[${req.method}::${req.socket.remoteAddress}]: ${req.protocol}://${req.get('host')}${req.url}`);

      const event: ExpressEvent = {
        protocol: req.protocol,
        host: req.get('host') || devServerConfig.serverDomain,
        path: req.url.substring(apiConfig.devPath.length).split('?')[0],
        ip: req.socket.remoteAddress || '127.0.0.1',
        query: req.query as { [key: string]: undefined | string | string[] },
        correlation: '',

        headers: req.headers as {
          [key: string]: undefined | string;
        },
        method: req.method,
        isBase64Encoded: false,
        body: typeof req.body === 'object' ? JSON.stringify(req.body) : req.body,
      };

      if (req.files) {
        event.files = req.files.map((file: any) => ({
          base64Data: file.buffer.toString('base64'),
          filename: file.originalname,
          mimetype: file.mimetype,
        }));
      }

      const response = await processEvent<ExpressEvent, ExpressEventResponse>(
        event,
        apiConfig.qpqConfig,
        getDynamicModuleLoader(apiConfig.qpqConfig, devServerConfig),
        getExpressApiEventEventProcessor,
      );

      if (response.result) {
        for (const [header, value] of Object.entries(response.result.headers)) {
          res.set(header, value);
        }

        if (response.result.isBase64Encoded) {
          res.status(response.result.statusCode).send(Buffer.from(response.result.body, 'base64'));
        } else {
          res.status(response.result.statusCode).send(response.result.body);
        }
      }
    } else {
      console.log(`NotFound::[${req.method}::${req.socket.remoteAddress}]: ${req.protocol}://${req.get('host')}${req.url}`);
      res.status(500).send({ message: 'resource does not exist' });
    }
  });

  app.listen(devServerConfig.serverPort, '0.0.0.0', () => {
    const baseDomain = getServiceBaseDomain(allServiceConfig[0], devServerConfig);

    console.log(`⚡️⚡️⚡️[Qpq - Dev Server]⚡️⚡️⚡️: Server is running at [http://${baseDomain}]`);
  });
};
