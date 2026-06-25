/**
 * qpq-log-extension
 *
 * An external AWS Lambda extension that ships story-result logs to S3 OFF the
 * function's response path.
 *
 * How it works:
 *  1. Registers with the Lambda Extensions API (INVOKE + SHUTDOWN events).
 *  2. Runs a tiny HTTP server on 127.0.0.1:<port>. The function handler POSTs a
 *     log payload to it (cheap, ~1ms) instead of awaiting the S3 PutObject.
 *  3. The PutObject is started immediately and runs in the background. Because
 *     of the 2021 Lambda change, the function response is returned to the caller
 *     as soon as the handler completes -- it does NOT wait for the extension. So
 *     the S3 write happens after the caller already has its response.
 *  4. On each INVOKE we drain in-flight writes (bounds memory / billed duration),
 *     and on SHUTDOWN we drain everything so nothing buffered is lost when the
 *     execution environment is torn down.
 *
 * Authored in TS, bundled to a single CJS file by scripts/buildLogExtensionLayer.mjs.
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

const EXTENSION_NAME = 'qpq-log-extension';
const API_VERSION = '2020-01-01';

// The handler talks to us here. Keep in sync with the QPQ_LOG_EXTENSION_PORT env var.
const HTTP_PORT = parseInt(process.env.QPQ_LOG_EXTENSION_PORT || '9009', 10);

// host:port of the Lambda Extensions/Runtime API. Always present in a real Lambda.
const RUNTIME_API = process.env.AWS_LAMBDA_RUNTIME_API;

// Allows the local harness to point the S3 client at a fake endpoint.
const S3_ENDPOINT = process.env.QPQ_LOG_EXTENSION_S3_ENDPOINT || undefined;

const log = (...args: any[]) => console.log(`[${EXTENSION_NAME}]`, ...args);

type LogPayload = {
  bucketName: string;
  region: string;
  key: string;
  body: string;
  storageClass?: PutObjectCommandInput['StorageClass'];
};

// Reuse one S3 client per region across invocations.
const s3ClientsByRegion = new Map<string, S3Client>();
const getS3Client = (region: string): S3Client => {
  let client = s3ClientsByRegion.get(region);
  if (!client) {
    client = new S3Client({
      region,
      ...(S3_ENDPOINT ? { endpoint: S3_ENDPOINT, forcePathStyle: true } : {}),
    });
    s3ClientsByRegion.set(region, client);
  }
  return client;
};

// In-flight S3 writes. Drained on INVOKE and SHUTDOWN.
const inFlight = new Set<Promise<void>>();

const shipToS3 = (payload: LogPayload): Promise<void> => {
  const client = getS3Client(payload.region);

  const promise = client
    .send(
      new PutObjectCommand({
        Bucket: payload.bucketName,
        Key: payload.key,
        Body: payload.body,
        StorageClass: payload.storageClass ?? 'INTELLIGENT_TIERING',
      }),
    )
    .then(() => {
      log(`shipped ${payload.key} -> ${payload.bucketName}`);
    })
    .catch((error) => {
      log(`failed to ship ${payload.key}:`, error?.message || error);
    })
    .finally(() => {
      inFlight.delete(promise);
    });

  inFlight.add(promise);
  return promise;
};

const drain = async (): Promise<void> => {
  if (inFlight.size === 0) return;
  await Promise.all([...inFlight]);
};

// --- Extensions API -------------------------------------------------------

const register = async (): Promise<string> => {
  const res = await fetch(`http://${RUNTIME_API}/${API_VERSION}/extension/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Must match the filename in /opt/extensions.
      'Lambda-Extension-Name': EXTENSION_NAME,
    },
    body: JSON.stringify({ events: ['INVOKE', 'SHUTDOWN'] }),
  });

  if (!res.ok) {
    throw new Error(`register failed: ${res.status} ${await res.text()}`);
  }

  const id = res.headers.get('lambda-extension-identifier');
  if (!id) {
    throw new Error('register response missing Lambda-Extension-Identifier header');
  }

  log('registered', id);
  return id;
};

const nextEvent = async (extensionId: string): Promise<any> => {
  // Long-poll. Resolves when the platform has the next INVOKE/SHUTDOWN event.
  const res = await fetch(`http://${RUNTIME_API}/${API_VERSION}/extension/event/next`, {
    method: 'GET',
    headers: { 'Lambda-Extension-Identifier': extensionId },
  });

  if (!res.ok) {
    throw new Error(`event/next failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
};

// --- Local HTTP server (handler -> extension) -----------------------------

const startHttpServer = (): Promise<void> => {
  return new Promise((resolve) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      if (req.method === 'POST' && req.url === '/log') {
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          try {
            const payload = JSON.parse(Buffer.concat(chunks).toString('utf8')) as LogPayload;
            // Start the S3 write immediately, ack the handler right away.
            shipToS3(payload);
            res.writeHead(202, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ queued: true }));
          } catch (error: any) {
            log('bad /log payload:', error?.message || error);
            res.writeHead(400);
            res.end();
          }
        });
        return;
      }

      if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, inFlight: inFlight.size }));
        return;
      }

      res.writeHead(404);
      res.end();
    });

    server.listen(HTTP_PORT, '127.0.0.1', () => {
      log(`listening on 127.0.0.1:${HTTP_PORT}`);
      resolve();
    });
  });
};

// --- Main loop ------------------------------------------------------------

const main = async (): Promise<void> => {
  if (!RUNTIME_API) {
    throw new Error('AWS_LAMBDA_RUNTIME_API not set - not running inside a Lambda execution environment');
  }

  await startHttpServer();
  const extensionId = await register();

   
  while (true) {
    const event = await nextEvent(extensionId);

    if (event?.eventType === 'SHUTDOWN') {
      log('shutdown received, draining', inFlight.size, 'writes');
      await drain();
      log('drained, exiting');
      // The HTTP server keeps the event loop alive; exit explicitly so the
      // process terminates promptly once we have flushed.
      process.exit(0);
    }

    // INVOKE: flush anything queued so far. Adds to billed duration, not to the
    // caller's response latency.
    await drain();
  }
};

main().catch((error) => {
  log('fatal:', error?.message || error);
  process.exit(1);
});
