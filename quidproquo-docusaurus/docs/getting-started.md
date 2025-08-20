---
sidebar_position: 1
---

# Getting Started

Get up and running with Quidproquo in minutes. This guide will walk you through installation, creating your first story, building an API, and deploying your application.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Basic knowledge of JavaScript/TypeScript
- Familiarity with generator functions (we'll explain the basics)

## Installation

### Create a New Project

```bash
# Create a new directory
mkdir my-qpq-app
cd my-qpq-app

# Initialize package.json
npm init -y

# Install TypeScript (recommended)
npm install --save-dev typescript @types/node
```

### Install Quidproquo Packages

```bash
# Core package (required)
npm install quidproquo-core

# Web server package (for APIs)
npm install quidproquo-webserver

# Development server (for local development)
npm install --save-dev quidproquo-dev-server

# Platform-specific processors (choose based on deployment target)
npm install quidproquo-actionprocessor-node  # For Node.js
# OR
npm install quidproquo-actionprocessor-awslambda  # For AWS
```

### TypeScript Configuration

Create a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Your First Story

Let's create a simple "Hello World" story to understand the basics.

### Understanding Generator Functions

Generator functions (marked with `*`) can pause and resume execution:

```typescript
// src/stories/hello.ts
import { askDateNow, askLogCreate } from 'quidproquo-core';

export function* helloWorldStory(name: string) {
  // Log the start
  yield* askLogCreate('INFO', `Starting hello for ${name}`);
  
  // Get current time
  const currentTime = yield* askDateNow();
  
  // Return greeting
  return `Hello ${name}! The time is ${currentTime}`;
}
```

**Key concepts:**
- `function*` declares a generator function
- `yield*` pauses execution and delegates to another generator
- Each `ask*` function returns a generator that yields an action
- The runtime processes each action and returns the result

### Creating Actions

Actions describe what you want to do:

```typescript
// src/stories/user.ts
import { 
  askKeyValueStoreGet,
  askKeyValueStoreUpsert,
  askGuidNew,
  askDateNow,
  askThrowError
} from 'quidproquo-core';

export function* createUserStory(email: string, name: string) {
  // Check if user exists
  const existingUser = yield* askKeyValueStoreGet('users', email);
  
  if (existingUser) {
    // Throw an error if user exists
    yield* askThrowError('USER_EXISTS', `User with email ${email} already exists`);
  }
  
  // Generate a new ID
  const userId = yield* askGuidNew();
  
  // Get current timestamp
  const createdAt = yield* askDateNow();
  
  // Create user object
  const user = {
    id: userId,
    email,
    name,
    createdAt
  };
  
  // Store the user
  yield* askKeyValueStoreUpsert('users', user);
  
  return user;
}
```

## Building Your First API

Now let's create a REST API using Quidproquo.

### Define Routes

```typescript
// src/api/index.ts
import { HTTPMethod, HTTPResponse } from 'quidproquo-webserver';
import { createUserStory } from '../stories/user';
import { askCatch } from 'quidproquo-core';

export function* handleCreateUser(request: any): Generator<any, HTTPResponse, any> {
  const { email, name } = JSON.parse(request.body);
  
  // Validate input
  if (!email || !name) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Email and name are required' })
    };
  }
  
  // Try to create user
  const result = yield* askCatch(createUserStory(email, name));
  
  if (result.success) {
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.result)
    };
  } else {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: result.error.errorText })
    };
  }
}
```

### Configure the API

```typescript
// src/config.ts
import { defineRoute, defineApi, defineService } from 'quidproquo-webserver';
import { defineKeyValueStore } from 'quidproquo-core';
import { handleCreateUser } from './api';

export default [
  // Define a key-value store for users
  defineKeyValueStore('users', {
    partitionKey: 'email',
    indexes: []
  }),
  
  // Define API routes
  defineApi('main', {
    routes: [
      defineRoute(HTTPMethod.POST, '/users', handleCreateUser),
      defineRoute(HTTPMethod.GET, '/health', function* () {
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'healthy' })
        };
      })
    ]
  }),
  
  // Define the service
  defineService('my-app', {
    apis: ['main']
  })
];
```

## Running Locally

The development server simulates cloud services locally.

### Create Dev Server Entry

```typescript
// src/dev.ts
import { createDevServer } from 'quidproquo-dev-server';
import config from './config';

const server = createDevServer({
  config,
  port: 3000,
  watch: true
});

server.start().then(() => {
  console.log('Dev server running on http://localhost:3000');
});
```

### Add Scripts to package.json

```json
{
  "scripts": {
    "dev": "ts-node src/dev.ts",
    "build": "tsc",
    "start": "node dist/dev.js"
  }
}
```

### Start the Dev Server

```bash
npm run dev
```

Your API is now running! Test it:

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "name": "Alice"}'

# Check health
curl http://localhost:3000/health
```

## Complete Example: Todo API

Let's build a more complete example - a Todo API with CRUD operations.

### Define Todo Stories

```typescript
// src/stories/todo.ts
import {
  askKeyValueStoreGet,
  askKeyValueStoreUpsert,
  askKeyValueStoreDelete,
  askKeyValueStoreQuery,
  askGuidNew,
  askDateNow,
  askThrowError
} from 'quidproquo-core';

interface Todo {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export function* createTodoStory(userId: string, title: string) {
  const todoId = yield* askGuidNew();
  const now = yield* askDateNow();
  
  const todo: Todo = {
    id: todoId,
    userId,
    title,
    completed: false,
    createdAt: now,
    updatedAt: now
  };
  
  yield* askKeyValueStoreUpsert('todos', todo);
  return todo;
}

export function* getTodoStory(todoId: string, userId: string) {
  const todo = yield* askKeyValueStoreGet('todos', todoId);
  
  if (!todo) {
    yield* askThrowError('NOT_FOUND', 'Todo not found');
  }
  
  if (todo.userId !== userId) {
    yield* askThrowError('FORBIDDEN', 'Access denied');
  }
  
  return todo;
}

export function* updateTodoStory(
  todoId: string, 
  userId: string, 
  updates: Partial<Pick<Todo, 'title' | 'completed'>>
) {
  // Get existing todo
  const todo = yield* getTodoStory(todoId, userId);
  
  // Update fields
  const updatedTodo = {
    ...todo,
    ...updates,
    updatedAt: yield* askDateNow()
  };
  
  yield* askKeyValueStoreUpsert('todos', updatedTodo);
  return updatedTodo;
}

export function* deleteTodoStory(todoId: string, userId: string) {
  // Verify ownership
  yield* getTodoStory(todoId, userId);
  
  // Delete
  yield* askKeyValueStoreDelete('todos', todoId);
  return { success: true };
}

export function* listTodosStory(userId: string) {
  const todos = yield* askKeyValueStoreQuery('todos', {
    index: 'byUser',
    keyCondition: {
      userId: { '=': userId }
    }
  });
  
  return todos;
}
```

### Create API Handlers

```typescript
// src/api/todos.ts
import { HTTPRequest, HTTPResponse } from 'quidproquo-webserver';
import { askCatch } from 'quidproquo-core';
import * as todoStories from '../stories/todo';

export function* createTodo(request: HTTPRequest): Generator<any, HTTPResponse, any> {
  const { title } = JSON.parse(request.body);
  const userId = request.headers['x-user-id']; // Simplified auth
  
  if (!title) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Title required' }) };
  }
  
  const todo = yield* todoStories.createTodoStory(userId, title);
  return { statusCode: 201, body: JSON.stringify(todo) };
}

export function* getTodo(request: HTTPRequest): Generator<any, HTTPResponse, any> {
  const todoId = request.pathParameters.id;
  const userId = request.headers['x-user-id'];
  
  const result = yield* askCatch(todoStories.getTodoStory(todoId, userId));
  
  if (!result.success) {
    const statusCode = result.error.errorType === 'NOT_FOUND' ? 404 : 403;
    return { statusCode, body: JSON.stringify({ error: result.error.errorText }) };
  }
  
  return { statusCode: 200, body: JSON.stringify(result.result) };
}

export function* updateTodo(request: HTTPRequest): Generator<any, HTTPResponse, any> {
  const todoId = request.pathParameters.id;
  const userId = request.headers['x-user-id'];
  const updates = JSON.parse(request.body);
  
  const result = yield* askCatch(
    todoStories.updateTodoStory(todoId, userId, updates)
  );
  
  if (!result.success) {
    return { statusCode: 400, body: JSON.stringify({ error: result.error.errorText }) };
  }
  
  return { statusCode: 200, body: JSON.stringify(result.result) };
}

export function* deleteTodo(request: HTTPRequest): Generator<any, HTTPResponse, any> {
  const todoId = request.pathParameters.id;
  const userId = request.headers['x-user-id'];
  
  const result = yield* askCatch(todoStories.deleteTodoStory(todoId, userId));
  
  if (!result.success) {
    return { statusCode: 400, body: JSON.stringify({ error: result.error.errorText }) };
  }
  
  return { statusCode: 204, body: '' };
}

export function* listTodos(request: HTTPRequest): Generator<any, HTTPResponse, any> {
  const userId = request.headers['x-user-id'];
  const todos = yield* todoStories.listTodosStory(userId);
  return { statusCode: 200, body: JSON.stringify(todos) };
}
```

### Configure Complete API

```typescript
// src/config/todos.ts
import { defineRoute, defineApi, HTTPMethod } from 'quidproquo-webserver';
import { defineKeyValueStore } from 'quidproquo-core';
import * as todoHandlers from '../api/todos';

export default [
  // Define storage
  defineKeyValueStore('todos', {
    partitionKey: 'id',
    indexes: [
      {
        name: 'byUser',
        partitionKey: 'userId',
        sortKey: 'createdAt'
      }
    ]
  }),
  
  // Define API
  defineApi('todos', {
    routes: [
      defineRoute(HTTPMethod.POST, '/todos', todoHandlers.createTodo),
      defineRoute(HTTPMethod.GET, '/todos', todoHandlers.listTodos),
      defineRoute(HTTPMethod.GET, '/todos/:id', todoHandlers.getTodo),
      defineRoute(HTTPMethod.PUT, '/todos/:id', todoHandlers.updateTodo),
      defineRoute(HTTPMethod.DELETE, '/todos/:id', todoHandlers.deleteTodo),
    ]
  })
];
```

## Deployment Options

Quidproquo supports multiple deployment targets. Here's how to deploy to common platforms.

### Deploy to AWS Lambda

```bash
# Install AWS CDK and QPQ deploy package
npm install --save-dev aws-cdk quidproquo-deploy-awscdk
npm install quidproquo-actionprocessor-awslambda

# Create CDK app
mkdir cdk
cd cdk
cdk init app --language typescript
```

Create CDK stack:

```typescript
// cdk/lib/my-app-stack.ts
import * as cdk from 'aws-cdk-lib';
import { QPQApp } from 'quidproquo-deploy-awscdk';
import config from '../../src/config';

export class MyAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    new QPQApp(this, 'MyQPQApp', {
      qpqConfig: config,
      environment: 'production'
    });
  }
}
```

Deploy:

```bash
cdk deploy
```

### Deploy to Node.js Server

```typescript
// src/server.ts
import express from 'express';
import { createNodeRuntime } from 'quidproquo-actionprocessor-node';
import config from './config';

const app = express();
const runtime = createNodeRuntime(config);

app.use(express.json());
app.all('*', async (req, res) => {
  const result = await runtime.handleHTTPRequest({
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: JSON.stringify(req.body),
    query: req.query
  });
  
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Deploy to Docker

Create a Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist
COPY config ./config

CMD ["node", "dist/server.js"]
```

Build and run:

```bash
npm run build
docker build -t my-qpq-app .
docker run -p 3000:3000 my-qpq-app
```

## Testing Your Application

Quidproquo's architecture makes testing straightforward.

### Unit Testing Stories

```typescript
// src/stories/todo.test.ts
import { createTodoStory } from './todo';

test('creates todo with correct fields', () => {
  const story = createTodoStory('user-123', 'Buy milk');
  
  // First yield: Generate ID
  const { value: guidAction } = story.next();
  expect(guidAction.type).toBe('Guid::New');
  
  // Provide mock ID
  const { value: dateAction } = story.next('todo-456');
  expect(dateAction.type).toBe('Date::Now');
  
  // Provide mock date
  const { value: storeAction } = story.next('2024-01-01T00:00:00Z');
  expect(storeAction.type).toBe('KeyValueStore::Upsert');
  expect(storeAction.payload.item).toEqual({
    id: 'todo-456',
    userId: 'user-123',
    title: 'Buy milk',
    completed: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  });
  
  // Complete story
  const { value: result } = story.next();
  expect(result.id).toBe('todo-456');
});
```

### Integration Testing

```typescript
// src/api/todos.test.ts
import { createTestRuntime } from 'quidproquo-testing';
import { createTodo } from './todos';

test('creates todo via API', async () => {
  const runtime = createTestRuntime({
    stores: {
      todos: new Map()
    }
  });
  
  const request = {
    body: JSON.stringify({ title: 'Test todo' }),
    headers: { 'x-user-id': 'user-123' }
  };
  
  const response = await runtime.execute(createTodo, request);
  
  expect(response.statusCode).toBe(201);
  const todo = JSON.parse(response.body);
  expect(todo.title).toBe('Test todo');
  expect(todo.userId).toBe('user-123');
});
```

## Debugging

Quidproquo provides excellent debugging capabilities.

### Enable Debug Logging

```typescript
// Set environment variable
process.env.QPQ_LOG_LEVEL = 'DEBUG';

// Or in config
import { defineLogging } from 'quidproquo-core';

export default [
  defineLogging({
    level: 'DEBUG',
    pretty: true
  }),
  // ... other config
];
```

### View Execution Logs

```typescript
// src/debug.ts
import { createDevServer } from 'quidproquo-dev-server';

const server = createDevServer({
  config,
  port: 3000,
  debug: {
    logActions: true,        // Log all actions
    logResults: true,        // Log action results
    logDuration: true,       // Log execution time
    slowThreshold: 100,      // Warn if action takes > 100ms
  }
});
```

### Replay Executions

```typescript
// Capture execution
const execution = await runtime.execute(myStory, args, {
  capture: true
});

// Save for debugging
fs.writeFileSync('execution.json', JSON.stringify(execution));

// Replay later
const executionLog = JSON.parse(fs.readFileSync('execution.json'));
const result = await qpqExecuteLog(executionLog, myStory);
```

## Best Practices

### 1. Keep Stories Pure

```typescript
// Good: Pure story with no side effects
function* calculatePrice(items: Item[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  return subtotal + tax;
}

// Bad: Side effects in story
function* calculatePrice(items: Item[]) {
  console.log('Calculating...');  // Side effect!
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  fs.writeFileSync('log.txt', `Subtotal: ${subtotal}`);  // Side effect!
  return subtotal * 1.1;
}
```

### 2. Use Composition

```typescript
// Compose smaller stories
function* validateEmail(email: string) {
  if (!email.includes('@')) {
    yield* askThrowError('INVALID_EMAIL', 'Invalid email format');
  }
}

function* createUser(email: string, name: string) {
  yield* validateEmail(email);  // Reuse validation
  // ... rest of creation logic
}
```

### 3. Handle Errors Gracefully

```typescript
function* safeOperation() {
  const result = yield* askCatch(riskyOperation());
  
  if (!result.success) {
    // Log error
    yield* askLogCreate('ERROR', result.error.errorText);
    // Return default
    return defaultValue;
  }
  
  return result.result;
}
```

### 4. Use TypeScript

```typescript
// Define types for your domain
interface User {
  id: string;
  email: string;
  name: string;
}

// Type your stories
function* getUser(userId: string): Generator<any, User, any> {
  const user = yield* askKeyValueStoreGet<User>('users', userId);
  if (!user) {
    yield* askThrowError('NOT_FOUND', 'User not found');
  }
  return user;
}
```

## Next Steps

Now that you have the basics, explore:

- [Core Concepts](./core-concepts.md) - Deep dive into the architecture
- [API Reference](./api/index.md) - Complete action reference
- [Use Cases](./use-cases.md) - Real-world examples
- [Architecture Overview](./architecture-overview.md) - Understanding the internals

## Getting Help

- **Documentation**: This site contains comprehensive documentation
- **GitHub Issues**: Report bugs or request features
- **Examples**: Check the examples directory in the repository
- **Community**: Join our Discord server (coming soon)

## Summary

You've learned how to:
- ✅ Install Quidproquo
- ✅ Create your first story
- ✅ Build a REST API
- ✅ Run locally with the dev server
- ✅ Deploy to various platforms
- ✅ Test your application
- ✅ Debug issues

Quidproquo provides a powerful, flexible foundation for building modern web applications. Its unique architecture enables you to write business logic once and deploy anywhere, with complete observability and testing capabilities built in.

Start building with Quidproquo today and experience the benefits of true platform independence!