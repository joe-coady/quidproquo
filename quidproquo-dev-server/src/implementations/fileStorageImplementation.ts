import { resolveFilePath, verifySecureUrlToken } from 'quidproquo-actionprocessor-node';
import { FileActionType } from 'quidproquo-core';

import express, { Express, Request, Response } from 'express';
import * as fs from 'fs/promises';
import multer from 'multer';
import * as path from 'path';

import { delayForAction } from '../logic/withProcessorDelay';
import { ResolvedDevServerConfig } from '../types';

const ensureParentDirectoryExists = async (filePath: string): Promise<void> => {
  const parentDir = path.dirname(filePath);
  await fs.mkdir(parentDir, { recursive: true });
};

export const fileStorageImplementation = async (devServerConfig: ResolvedDevServerConfig) => {
  const app: Express = express();
  const upload = multer({ storage: multer.memoryStorage() });
  
  const port = devServerConfig.fileStorageConfig.secureUrlPort;
  
  console.log(`Starting QPQ File Storage Server on port ${port}`);
  
  // CORS headers for all endpoints
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    
    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'qpq-file-storage' });
  });
  
  // Secure download endpoint
  app.get('/secure-download', async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.query.token as string;
      
      if (!token) {
        res.status(400).json({ error: 'Missing token parameter' });
        return;
      }
      
      const tokenData = verifySecureUrlToken(token, devServerConfig.fileStorageConfig.secureUrlSecret);
      
      if (!tokenData) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
      
      if (tokenData.operation !== 'download') {
        res.status(403).json({ error: 'Invalid token operation' });
        return;
      }

      await delayForAction(devServerConfig.delay, FileActionType.GenerateTemporarySecureUrl);

      try {
        // Check if file exists
        await fs.access(tokenData.fullFilepath);
        
        // Mirror real S3: serve the object's stored mimetype + content-disposition (written as a
        // sidecar by the binary-write processor) so e.g. a PDF renders inline instead of force-
        // downloading. No sidecar → fall back to the generic attachment download.
        const filename = path.basename(tokenData.fullFilepath);
        let contentDisposition = `attachment; filename="${filename}"`;
        let contentType: string | undefined;
        try {
          const meta = JSON.parse(
            await fs.readFile(`${tokenData.fullFilepath}.qpqmeta.json`, 'utf8')
          );
          if (meta.mimetype) {
            contentType = meta.mimetype;
          }
          if (meta.contentDisposition === 'inline') {
            contentDisposition = 'inline';
          } else if (meta.contentDisposition) {
            contentDisposition = `${meta.contentDisposition}; filename="${filename}"`;
          }
        } catch {
          // No sidecar metadata → keep the default attachment behaviour.
        }

        if (contentType) {
          res.setHeader('Content-Type', contentType);
        }
        res.setHeader('Content-Disposition', contentDisposition);

        // Stream the file
        const fileBuffer = await fs.readFile(tokenData.fullFilepath);
        res.send(fileBuffer);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          res.status(404).json({ error: 'File not found' });
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in secure-download:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  const writeUploadFromToken = async (
    token: string | undefined,
    buffer: Buffer | undefined,
    res: Response
  ): Promise<void> => {
    if (!token) {
      console.log('Upload attempt with missing token');
      res.status(400).json({ error: 'Missing token parameter' });
      return;
    }

    const tokenData = verifySecureUrlToken(token, devServerConfig.fileStorageConfig.secureUrlSecret);

    if (!tokenData) {
      console.log('Upload attempt with invalid/expired token');
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    console.log(`Valid upload token for ${tokenData.fullFilepath}`);

    if (tokenData.operation !== 'upload') {
      res.status(403).json({ error: 'Invalid token operation' });
      return;
    }

    if (!buffer || buffer.length === 0) {
      res.status(400).json({ error: 'No file body received' });
      return;
    }

    await delayForAction(devServerConfig.delay, FileActionType.GenerateTemporaryUploadSecureUrl);

    await ensureParentDirectoryExists(tokenData.fullFilepath);
    await fs.writeFile(tokenData.fullFilepath, buffer);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      filepath: tokenData.fullFilepath,
      size: buffer.length
    });
  };

  // Secure upload endpoint — PUT with raw body (matches S3 presigned PUT contract)
  app.put(
    '/secure-upload',
    express.raw({ type: '*/*', limit: '500mb' }),
    async (req: Request, res: Response): Promise<void> => {
      try {
        await writeUploadFromToken(req.query.token as string, req.body, res);
      } catch (error) {
        console.error('Error in secure-upload (PUT):', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  // Secure upload endpoint — legacy POST + multipart (kept for backwards compatibility)
  app.post('/secure-upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      await writeUploadFromToken(req.query.token as string, req.file.buffer, res);
    } catch (error) {
      console.error('Error in secure-upload (POST):', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Start the server
  app.listen(port, () => {
    const fullStoragePath = path.join(devServerConfig.runtimePath, devServerConfig.fileStorageConfig.storagePath);
    console.log(`QPQ File Storage Server listening on port ${port}`);
    console.log(`Runtime path: ${devServerConfig.runtimePath}`);
    console.log(`Storage base path: ${fullStoragePath}`);
  });
};