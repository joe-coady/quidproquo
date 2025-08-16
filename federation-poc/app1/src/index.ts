import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';
import { registerPlugins, loadRemote } from '@module-federation/enhanced/runtime';

// @ts-ignore - no types for this yet
const nodePlugin = require('@module-federation/node/runtimePlugin');

interface RemoteInfo {
  name: string;
  entry: string;
  type: string;
  entryGlobalName?: string;
  shareScope?: string;
  alias?: string;
}

interface AfterResolveArgs {
  remoteInfo: RemoteInfo;
  [key: string]: any;
}

interface ErrorLoadRemoteArgs {
  lifecycle: string;
  id: string;
  error: Error;
}

interface NodeFSFetchPluginOptions {
  baseDir: string;
  entryName?: string;
}

function nodeFSFetchPlugin({ baseDir, entryName = 'remoteEntry.js' }: NodeFSFetchPluginOptions) {
  return {
    name: 'node-fs-fetch',

    // Intercept before resolving the remote to redirect to local file
    async afterResolve(args: AfterResolveArgs): Promise<AfterResolveArgs> {
      const { remoteInfo } = args;

      // Only handle app2 remote
      if (remoteInfo.name === 'app2') {
        const file = path.join(baseDir, entryName);

        console.log('[node-fs-fetch] Redirecting app2 to local file:', file);

        // Load the local file directly
        const moduleRequire = createRequire(file);
        const mod = moduleRequire(file);

        // Extract the container from the CommonJS export
        const container = mod.app2 || mod[remoteInfo.name] || mod.default || mod;

        // Store it globally so the runtime can access it
        (globalThis as any)[remoteInfo.entryGlobalName || remoteInfo.name] = container;

        // Update the remoteInfo to use a script type that will load from global
        args.remoteInfo = {
          ...remoteInfo,
          entry: file,
          type: 'global',
          entryGlobalName: remoteInfo.entryGlobalName || remoteInfo.name
        };
      }

      return args;
    },

    // Handle loading errors and provide fallback
    async errorLoadRemote({ lifecycle, id, error }: ErrorLoadRemoteArgs): Promise<never> {
      console.log(`[node-fs-fetch] - error - ${lifecycle} - ${id}`);

      // Let other errors propagate
      throw error;
    }
  };
}

registerPlugins([
  nodePlugin.default(),
  nodeFSFetchPlugin({ baseDir: path.join(__dirname, '../../app2/dist') }),
]);

async function startApp(): Promise<void> {
  console.log('[APP1] Starting server on port 3001...');

  const server = http.createServer((req, res) => {
    if (req.url === '/remoteEntry.js') {
      const filePath = path.join(__dirname, '../dist/remoteEntry.js');
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(data);
        }
      });
    } else if (req.url && req.url.includes('.js')) {
      const filePath = path.join(__dirname, '../dist', req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(data);
        }
      });
    } else {
      res.writeHead(200);
      res.end('APP1 Server Running');
    }
  });

  server.listen(3001);
  console.log('[APP1] Server running on http://localhost:3001');

  const testFederation = async (): Promise<void> => {
    try {
      const multiplyModule = await loadRemote('app2/multiply') as any;
      const multiply = multiplyModule.default || multiplyModule;
      const result = multiply(3, 4);
      console.log('[APP1] Successfully used multiply from APP2:', result);
    } catch (err: any) {
      console.log('[APP1] Error loading from APP2:', err.message);
      setTimeout(testFederation, 3000);
    }
  };

  setTimeout(testFederation, 3000);
}

startApp();