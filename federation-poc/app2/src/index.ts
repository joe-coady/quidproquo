import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { loadRemote } from '@module-federation/enhanced/runtime';

async function startApp(): Promise<void> {
  console.log('[APP2] Starting server on port 3002...');

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
      res.end('APP2 Server Running');
    }
  });

  server.listen(3002);
  console.log('[APP2] Server running on http://localhost:3002');

  // Test loading from APP1
  const testFederation = async (): Promise<void> => {
    try {
      const addModule = await loadRemote('app1/add') as any;
      const add = addModule.default || addModule;
      const result = add(5, 6);
      console.log('[APP2] Successfully used add from APP1:', result);
    } catch (err: any) {
      console.log('[APP2] Error loading from APP1:', err.message);
      setTimeout(testFederation, 3000);
    }
  };

  setTimeout(testFederation, 4000);
}

startApp();