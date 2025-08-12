import { getCustomActionActionProcessor } from 'quidproquo-actionprocessor-node';
import { askExecuteStory, createRuntime, DynamicModuleLoader,QPQConfig, qpqCoreUtils, QpqRuntimeType, StorySession } from 'quidproquo-core';
import { StorageDriveEvent, StorageDriveEventType } from 'quidproquo-webserver';

import * as chokidar from 'chokidar';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

import { getDevServerActionProcessors } from '../../actionProcessor';
import { ResolvedDevServerConfig } from '../../types';
import { getDevServerLogger } from '../logger';

interface FileEventPayload {
  service: string;
  drive: string;
  filepath: string;
  event: 'create' | 'delete';
}

const getDateNow = () => new Date().toISOString();

export const fileWatcherImplementation = async (devServerConfig: ResolvedDevServerConfig) => {
  const storagePath = devServerConfig.fileStorageConfig.storagePath;
  
  // Ensure storage directory exists
  try {
    await fs.mkdir(storagePath, { recursive: true });
  } catch (error) {
    console.error('Error creating storage directory:', error);
  }
  
  // Create a watcher for the storage directory
  const watcher = chokidar.watch(storagePath, {
    persistent: true,
    ignoreInitial: true, // Don't fire events for existing files
    followSymlinks: false,
    awaitWriteFinish: {
      stabilityThreshold: 500, // Wait for file to be stable for 500ms
      pollInterval: 100
    },
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/.*', // Ignore hidden files
      '**/*.tmp', // Ignore temp files
    ]
  });

  // Parse file path to extract service, drive, and relative filepath
  const parseFilePath = (fullPath: string): FileEventPayload | null => {
    try {
      const relativePath = path.relative(storagePath, fullPath);
      const parts = relativePath.split(path.sep);
      
      if (parts.length < 3) {
        // Not enough parts for service/drive/file structure
        return null;
      }
      
      const [service, drive, ...filePathParts] = parts;
      const filepath = filePathParts.join(path.sep);
      
      return {
        service,
        drive,
        filepath,
        event: 'create' // Will be overridden by the specific event
      };
    } catch (error) {
      console.error('Error parsing file path:', fullPath, error);
      return null;
    }
  };

  // Find the QPQ config for a specific service
  const findServiceConfig = (serviceName: string): QPQConfig | undefined => {
    return devServerConfig.qpqConfigs.find(
      config => qpqCoreUtils.getApplicationModuleName(config) === serviceName
    );
  };

  // Execute the storage drive event function
  const executeStorageDriveEvent = async (
    eventPayload: FileEventPayload,
    qpqConfig: QPQConfig,
    functionRuntime: any
  ) => {
    const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
    
    // Create a story session for the event with storage event context
    const storySession: StorySession = {
      context: {
        storageEvent: {
          drive: eventPayload.drive,
          filepath: eventPayload.filepath,
          event: eventPayload.event
        }
      },
      depth: 0
    };
    
    const logger = getDevServerLogger(qpqConfig, devServerConfig, storySession);
    
    // Create event data to pass to the function matching StorageDriveEvent structure
    const eventData: StorageDriveEvent = {
      eventType: eventPayload.event === 'create' ? StorageDriveEventType.Create : StorageDriveEventType.Delete,
      driveName: eventPayload.drive,
      filePaths: [eventPayload.filepath]
    };
    
    // Create a DynamicModuleLoader adapter for this service
    const dynamicModuleLoaderForService: DynamicModuleLoader = (runtime) => 
      devServerConfig.dynamicModuleLoader(serviceName, runtime);
    
    // Create runtime and execute the story directly
    const resolveStory = createRuntime(
      qpqConfig,
      storySession,
      async () => ({
        ...(await getDevServerActionProcessors(qpqConfig, dynamicModuleLoaderForService, devServerConfig)),
        ...(await getCustomActionActionProcessor(qpqConfig, dynamicModuleLoaderForService)),
      }),
      getDateNow,
      logger,
      `${serviceName}::storage-event::${randomUUID()}`,
      QpqRuntimeType.SERVICE_FUNCTION_EXE,
      dynamicModuleLoaderForService,
      undefined,
      []
    );
    
    try {
      // Execute the story directly with the function runtime and event data
      const result = await resolveStory(askExecuteStory, [functionRuntime, [eventData], storySession]);
      console.log(`Storage event ${eventPayload.event} executed for ${eventPayload.filepath} in drive ${eventPayload.drive}`);
      return result;
    } catch (error) {
      console.error(`Error executing storage event ${eventPayload.event}:`, error);
      throw error;
    } finally {
      await logger.waitToFinishWriting();
    }
  };

  // Handle file creation events
  const handleFileCreate = async (fullPath: string) => {
    const eventPayload = parseFilePath(fullPath);
    if (!eventPayload) return;
    
    eventPayload.event = 'create';
    
    // Find the service config
    const qpqConfig = findServiceConfig(eventPayload.service);
    if (!qpqConfig) {
      console.debug(`No config found for service: ${eventPayload.service}`);
      return;
    }
    
    // Check if this drive has a create event handler
    const storageDrive = qpqCoreUtils.getStorageDriveByName(eventPayload.drive, qpqConfig);
    if (!storageDrive?.onEvent?.create) {
      console.debug(`No create event handler for drive: ${eventPayload.drive}`);
      return;
    }
    
    // Execute the function
    try {
      await executeStorageDriveEvent(eventPayload, qpqConfig, storageDrive.onEvent.create);
    } catch (error) {
      console.error(`Error handling create event for ${fullPath}:`, error);
    }
  };

  // Handle file deletion events
  const handleFileDelete = async (fullPath: string) => {
    const eventPayload = parseFilePath(fullPath);
    if (!eventPayload) return;
    
    eventPayload.event = 'delete';
    
    // Find the service config
    const qpqConfig = findServiceConfig(eventPayload.service);
    if (!qpqConfig) {
      console.debug(`No config found for service: ${eventPayload.service}`);
      return;
    }
    
    // Check if this drive has a delete event handler
    const storageDrive = qpqCoreUtils.getStorageDriveByName(eventPayload.drive, qpqConfig);
    if (!storageDrive?.onEvent?.delete) {
      console.debug(`No delete event handler for drive: ${eventPayload.drive}`);
      return;
    }
    
    // Execute the function
    try {
      await executeStorageDriveEvent(eventPayload, qpqConfig, storageDrive.onEvent.delete);
    } catch (error) {
      console.error(`Error handling delete event for ${fullPath}:`, error);
    }
  };

  // Set up event listeners
  watcher
    .on('add', async (filePath) => {
      // Only handle files, not directories
      try {
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          console.log(`File created: ${filePath}`);
          await handleFileCreate(filePath);
        }
      } catch (error) {
        // File might have been deleted already
        console.debug('Could not stat file:', filePath);
      }
    })
    .on('unlink', async (filePath) => {
      console.log(`File deleted: ${filePath}`);
      await handleFileDelete(filePath);
    })
    .on('error', (error) => {
      console.error('File watcher error:', error);
    })
    .on('ready', () => {
      console.log(`File watcher ready. Watching: ${storagePath}`);
    });

  // Return cleanup function
  return async () => {
    await watcher.close();
    console.log('File watcher closed');
  };
};