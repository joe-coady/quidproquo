---
sidebar_position: 2
---

# Config Actions

Manage application configuration, parameters, secrets, and global values in your Quidproquo applications.

## Overview

Config actions provide a platform-agnostic way to manage application configuration. They handle parameters, secrets, global values, and application metadata, with platform-specific implementations handling the actual storage and retrieval (e.g., AWS Parameter Store, environment variables, HashiCorp Vault).

## Configuration Types

Quidproquo distinguishes between different types of configuration:

1. **Parameters**: Non-sensitive configuration values that can change between environments
2. **Secrets**: Sensitive values like API keys, passwords, and tokens
3. **Globals**: Static values compiled into your application
4. **Application Info**: Metadata about your application deployment

## Available Actions

### askConfigGetParameter

Retrieve a configuration parameter value.

#### Signature

```typescript
function* askConfigGetParameter(
  parameterName: string
): Generator<ConfigGetParameterAction, string, any>
```

#### Parameters

- **parameterName** (`string`): The name of the parameter to retrieve

#### Returns

Returns the parameter value as a string.

#### Example

```typescript
import { askConfigGetParameter } from 'quidproquo-core';

function* getApiConfiguration() {
  const apiUrl = yield* askConfigGetParameter('api-base-url');
  const timeout = yield* askConfigGetParameter('api-timeout');
  const retryCount = yield* askConfigGetParameter('api-retry-count');
  
  return {
    url: apiUrl,
    timeout: parseInt(timeout),
    retries: parseInt(retryCount)
  };
}
```

### askConfigGetParameters

Retrieve multiple configuration parameters at once.

#### Signature

```typescript
function* askConfigGetParameters(
  parameterNames: string[]
): Generator<ConfigGetParametersAction, Record<string, string>, any>
```

#### Parameters

- **parameterNames** (`string[]`): Array of parameter names to retrieve

#### Returns

Returns an object with parameter names as keys and their values as strings.

#### Example

```typescript
function* getDatabaseConfig() {
  const params = yield* askConfigGetParameters([
    'db-host',
    'db-port',
    'db-name',
    'db-pool-size'
  ]);
  
  return {
    host: params['db-host'],
    port: parseInt(params['db-port']),
    database: params['db-name'],
    poolSize: parseInt(params['db-pool-size'])
  };
}
```

### askConfigSetParameter

Set or update a configuration parameter value.

#### Signature

```typescript
function* askConfigSetParameter(
  parameterName: string,
  value: string
): Generator<ConfigSetParameterAction, void, any>
```

#### Parameters

- **parameterName** (`string`): The name of the parameter to set
- **value** (`string`): The value to set

#### Example

```typescript
function* updateFeatureFlag(flagName: string, enabled: boolean) {
  yield* askConfigSetParameter(
    `feature-flag-${flagName}`,
    enabled.toString()
  );
  
  // Log the change
  yield* askLogCreate('INFO', `Feature flag ${flagName} set to ${enabled}`);
}
```

### askConfigListParameters

List all available parameters, optionally filtered by prefix.

#### Signature

```typescript
function* askConfigListParameters(
  prefix?: string
): Generator<ConfigListParametersAction, string[], any>
```

#### Parameters

- **prefix** (`string`, optional): Filter parameters by this prefix

#### Returns

Returns an array of parameter names.

#### Example

```typescript
function* listFeatureFlags() {
  // List all parameters starting with 'feature-flag-'
  const flagNames = yield* askConfigListParameters('feature-flag-');
  
  // Get all flag values
  const flags = {};
  for (const name of flagNames) {
    const value = yield* askConfigGetParameter(name);
    const flagName = name.replace('feature-flag-', '');
    flags[flagName] = value === 'true';
  }
  
  return flags;
}
```

### askConfigGetSecret

Retrieve a secret value securely.

#### Signature

```typescript
function* askConfigGetSecret(
  secretName: string
): Generator<ConfigGetSecretAction, string, any>
```

#### Parameters

- **secretName** (`string`): The name of the secret to retrieve

#### Returns

Returns the secret value as a string.

#### Example

```typescript
function* connectToDatabase() {
  const password = yield* askConfigGetSecret('database-password');
  const apiKey = yield* askConfigGetSecret('encryption-key');
  
  // Use secrets to establish connection
  const connection = yield* askDatabaseConnect({
    host: yield* askConfigGetParameter('db-host'),
    username: yield* askConfigGetParameter('db-user'),
    password, // Secret value
    encryption: {
      key: apiKey // Secret value
    }
  });
  
  return connection;
}
```

### askConfigGetGlobal

Retrieve a global value that was defined at build time.

#### Signature

```typescript
function* askConfigGetGlobal<T>(
  globalName: string
): Generator<ConfigGetGlobalAction, T, any>
```

#### Type Parameters

- **T**: The type of the global value

#### Parameters

- **globalName** (`string`): The name of the global to retrieve

#### Returns

Returns the global value with its original type.

#### Example

```typescript
function* getEnvironmentInfo() {
  const environment = yield* askConfigGetGlobal<string>('environment');
  const region = yield* askConfigGetGlobal<string>('aws-region');
  const features = yield* askConfigGetGlobal<string[]>('enabled-features');
  
  return {
    environment,
    region,
    features
  };
}
```

### askConfigGetApplicationInfo

Retrieve application metadata and deployment information.

#### Signature

```typescript
function* askConfigGetApplicationInfo(): Generator<ConfigGetApplicationInfoAction, ApplicationInfo, any>
```

#### Returns

Returns an `ApplicationInfo` object containing:
- `name`: Application name
- `version`: Application version
- `environment`: Deployment environment
- `deploymentId`: Unique deployment identifier
- `buildTime`: When the application was built
- `startTime`: When the application started

#### Example

```typescript
function* getHealthStatus() {
  const appInfo = yield* askConfigGetApplicationInfo();
  
  return {
    status: 'healthy',
    application: appInfo.name,
    version: appInfo.version,
    environment: appInfo.environment,
    uptime: Date.now() - Date.parse(appInfo.startTime)
  };
}
```

## Configuration Definition

Define configuration in your QPQ config files:

### Defining Parameters

```typescript
import { defineParameter } from 'quidproquo-core';

export default [
  // Simple parameter
  defineParameter('api-url'),
  
  // Parameter with metadata
  defineParameter('max-retries', {
    description: 'Maximum number of API retry attempts',
    defaultValue: '3',
    type: 'number',
    validation: {
      min: 1,
      max: 10
    }
  }),
  
  // Environment-specific parameter
  defineParameter('log-level', {
    description: 'Application log level',
    environments: {
      development: 'debug',
      staging: 'info',
      production: 'error'
    }
  })
];
```

### Defining Secrets

```typescript
import { defineSecret } from 'quidproquo-core';

export default [
  // Simple secret
  defineSecret('api-key'),
  
  // Secret with metadata
  defineSecret('database-password', {
    description: 'Primary database password',
    rotationDays: 90,
    required: true
  }),
  
  // Secret with version
  defineSecret('encryption-key', {
    description: 'Data encryption key',
    version: 'latest',
    autoRotate: true
  })
];
```

### Defining Globals

```typescript
import { defineGlobal } from 'quidproquo-core';

export default [
  // String global
  defineGlobal('environment', process.env.NODE_ENV || 'development'),
  
  // Object global
  defineGlobal('features', {
    authentication: true,
    billing: false,
    analytics: true
  }),
  
  // Array global
  defineGlobal('supported-languages', ['en', 'es', 'fr', 'de']),
  
  // Build-time computed global
  defineGlobal('build-info', {
    time: new Date().toISOString(),
    commit: process.env.GIT_COMMIT || 'unknown',
    branch: process.env.GIT_BRANCH || 'unknown'
  })
];
```

### Defining Application Info

```typescript
import { defineApplicationModule, defineApplicationVersion } from 'quidproquo-core';

export default [
  // Application name and module
  defineApplicationModule(
    'my-app',
    'com.example.myapp',
    process.env.NODE_ENV || 'development',
    __dirname
  ),
  
  // Application version
  defineApplicationVersion(
    process.env.npm_package_version || '0.0.0'
  )
];
```

## Usage Patterns

### Environment-Specific Configuration

```typescript
function* getEnvironmentConfig() {
  const env = yield* askConfigGetGlobal<string>('environment');
  
  // Load environment-specific parameters
  const configPrefix = `${env}-`;
  const paramNames = yield* askConfigListParameters(configPrefix);
  
  const config = {};
  for (const name of paramNames) {
    const key = name.replace(configPrefix, '');
    config[key] = yield* askConfigGetParameter(name);
  }
  
  return config;
}
```

### Feature Flags

```typescript
function* isFeatureEnabled(featureName: string) {
  try {
    const flagValue = yield* askConfigGetParameter(`feature-${featureName}`);
    return flagValue === 'true';
  } catch {
    // Feature flag not found, default to disabled
    return false;
  }
}

function* executeWithFeatureFlag(featureName: string, newLogic: Function, oldLogic: Function) {
  const enabled = yield* isFeatureEnabled(featureName);
  
  if (enabled) {
    yield* askLogCreate('INFO', `Using new logic for feature: ${featureName}`);
    return yield* newLogic();
  } else {
    return yield* oldLogic();
  }
}
```

### Dynamic Configuration Updates

```typescript
function* updateConfiguration(updates: Record<string, string>) {
  // Update multiple parameters
  for (const [key, value] of Object.entries(updates)) {
    yield* askConfigSetParameter(key, value);
    yield* askLogCreate('INFO', `Updated config: ${key}`);
  }
  
  // Notify other services
  yield* askEventBusSendMessage('config-updated', {
    parameters: Object.keys(updates),
    timestamp: yield* askDateNow()
  });
}
```

### Configuration Caching

```typescript
function* getCachedConfig(paramName: string) {
  const cacheKey = `config-cache-${paramName}`;
  
  // Try cache first
  const cached = yield* askKeyValueStoreGet('cache', cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }
  
  // Get fresh value
  const value = yield* askConfigGetParameter(paramName);
  
  // Cache for 5 minutes
  yield* askKeyValueStoreUpsert('cache', {
    key: cacheKey,
    value,
    expires: Date.now() + 300000
  });
  
  return value;
}
```

## Error Handling

### Handling Missing Configuration

```typescript
function* getConfigWithDefault(paramName: string, defaultValue: string) {
  const result = yield* askCatch(
    askConfigGetParameter(paramName)
  );
  
  if (!result.success) {
    yield* askLogCreate('WARN', `Parameter ${paramName} not found, using default: ${defaultValue}`);
    return defaultValue;
  }
  
  return result.result;
}
```

### Validating Configuration

```typescript
function* validateDatabaseConfig() {
  const required = ['db-host', 'db-port', 'db-name', 'db-user'];
  const missing = [];
  
  for (const param of required) {
    const result = yield* askCatch(askConfigGetParameter(param));
    if (!result.success) {
      missing.push(param);
    }
  }
  
  if (missing.length > 0) {
    yield* askThrowError(
      'CONFIG_ERROR',
      `Missing required parameters: ${missing.join(', ')}`
    );
  }
  
  // Validate password exists as secret
  const secretResult = yield* askCatch(
    askConfigGetSecret('database-password')
  );
  
  if (!secretResult.success) {
    yield* askThrowError(
      'CONFIG_ERROR',
      'Database password secret not found'
    );
  }
}
```

## Security Best Practices

### 1. Never Log Secrets

```typescript
function* secureConnection() {
  const apiKey = yield* askConfigGetSecret('api-key');
  
  // NEVER do this:
  // yield* askLogCreate('INFO', `Using API key: ${apiKey}`);
  
  // Do this instead:
  yield* askLogCreate('INFO', 'Retrieved API key successfully');
  
  return apiKey;
}
```

### 2. Rotate Secrets Regularly

```typescript
function* rotateApiKey() {
  // Generate new key
  const newKey = yield* askGenerateSecureToken();
  
  // Update secret
  yield* askConfigSetSecret('api-key', newKey);
  
  // Notify dependent services
  yield* askEventBusSendMessage('secret-rotated', {
    secretName: 'api-key',
    timestamp: yield* askDateNow()
  });
  
  // Log rotation (without revealing the key)
  yield* askLogCreate('AUDIT', 'API key rotated successfully');
}
```

### 3. Use Least Privilege Access

```typescript
function* getUserConfiguration(userId: string, userRole: string) {
  // Only admins can access sensitive config
  if (userRole !== 'admin') {
    return yield* askConfigGetParameters([
      'app-name',
      'app-version',
      'public-api-url'
    ]);
  }
  
  // Admins get additional config
  return yield* askConfigGetParameters([
    'app-name',
    'app-version',
    'public-api-url',
    'internal-api-url',
    'debug-mode',
    'feature-flags'
  ]);
}
```

### 4. Encrypt Sensitive Parameters

```typescript
function* storeSensitiveConfig(key: string, value: string) {
  // Encrypt before storing as parameter
  const encrypted = yield* askEncrypt(value);
  yield* askConfigSetParameter(key, encrypted);
}

function* retrieveSensitiveConfig(key: string) {
  const encrypted = yield* askConfigGetParameter(key);
  return yield* askDecrypt(encrypted);
}
```

## Platform-Specific Implementations

### AWS

- Parameters → AWS Systems Manager Parameter Store
- Secrets → AWS Secrets Manager
- Globals → Lambda environment variables or build-time constants

### Azure

- Parameters → Azure App Configuration
- Secrets → Azure Key Vault
- Globals → App Service application settings

### Google Cloud

- Parameters → Cloud Runtime Configuration
- Secrets → Secret Manager
- Globals → Environment variables

### Local Development

- Parameters → `.env` files or local JSON
- Secrets → `.env.local` (git-ignored)
- Globals → Build-time constants

## Testing

### Unit Testing

```typescript
test('loads API configuration', () => {
  const story = getApiConfiguration();
  
  // First yield: get base URL
  const { value: urlAction } = story.next();
  expect(urlAction.type).toBe('Config::GetParameter');
  expect(urlAction.payload.parameterName).toBe('api-base-url');
  
  // Provide mock URL
  const { value: timeoutAction } = story.next('https://api.example.com');
  expect(timeoutAction.payload.parameterName).toBe('api-timeout');
  
  // Provide mock timeout
  const { value: retryAction } = story.next('5000');
  expect(retryAction.payload.parameterName).toBe('api-retry-count');
  
  // Provide mock retry count and get result
  const { value: result } = story.next('3');
  expect(result).toEqual({
    url: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  });
});
```

### Integration Testing

```typescript
test('configuration flow', async () => {
  const runtime = createTestRuntime({
    config: {
      parameters: {
        'api-url': 'https://test.api.com',
        'api-timeout': '3000'
      },
      secrets: {
        'api-key': 'test-key-123'
      },
      globals: {
        'environment': 'test'
      }
    }
  });
  
  const config = await runtime.execute(getFullConfiguration);
  
  expect(config.apiUrl).toBe('https://test.api.com');
  expect(config.timeout).toBe(3000);
  expect(config.environment).toBe('test');
  // Don't assert on secrets in tests
});
```

## Migration Guide

### From Environment Variables

```typescript
// Before: Direct environment variable access
function getConfig() {
  return {
    apiUrl: process.env.API_URL,
    apiKey: process.env.API_KEY,
    debug: process.env.DEBUG === 'true'
  };
}

// After: Using Config actions
function* getConfig() {
  return {
    apiUrl: yield* askConfigGetParameter('api-url'),
    apiKey: yield* askConfigGetSecret('api-key'),
    debug: (yield* askConfigGetParameter('debug')) === 'true'
  };
}
```

### From JSON Config Files

```typescript
// Before: Reading config.json
const config = require('./config.json');
function getDbHost() {
  return config.database.host;
}

// After: Using Config actions
function* getDbHost() {
  return yield* askConfigGetParameter('db-host');
}
```

## Monitoring

```typescript
function* monitorConfigAccess() {
  // Log parameter access
  const wrapper = function* (paramName: string) {
    const startTime = Date.now();
    const value = yield* askConfigGetParameter(paramName);
    
    yield* askEventBusSendMessage('config-accessed', {
      parameter: paramName,
      duration: Date.now() - startTime,
      timestamp: yield* askDateNow()
    });
    
    return value;
  };
  
  return wrapper;
}
```

## Related Actions

- **KeyValueStore Actions** - For caching configuration
- **Log Actions** - For audit logging
- **Event Actions** - For configuration change notifications
- **File Actions** - For loading config from files