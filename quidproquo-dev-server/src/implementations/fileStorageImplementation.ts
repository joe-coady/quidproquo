import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs/promises';
import * as path from 'path';

import { ResolvedDevServerConfig } from '../types';
import { resolveFilePath, verifySecureUrlToken } from 'quidproquo-actionprocessor-node';

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
      
      try {
        // Check if file exists
        await fs.access(tokenData.fullFilepath);
        
        // Set appropriate headers
        const filename = path.basename(tokenData.fullFilepath);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
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
  
  // Secure upload endpoint
  app.post('/secure-upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.query.token as string;
      
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
      
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      
      // Ensure parent directory exists
      await ensureParentDirectoryExists(tokenData.fullFilepath);

      // Write the file
      await fs.writeFile(tokenData.fullFilepath, req.file.buffer);

      res.json({
        success: true,
        message: 'File uploaded successfully',
        filepath: tokenData.fullFilepath,
        size: req.file.size
      });
    } catch (error) {
      console.error('Error in secure-upload:', error);
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