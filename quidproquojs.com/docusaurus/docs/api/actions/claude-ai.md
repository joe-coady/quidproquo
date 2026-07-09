---
sidebar_position: 1
---

# Claude AI Actions

Integrate Claude AI capabilities into your Quidproquo applications for intelligent text generation, analysis, and conversation.

## Overview

The Claude AI actions provide a platform-agnostic interface to Anthropic's Claude AI models. These actions allow you to send messages to Claude and receive intelligent responses, enabling AI-powered features in your applications.

## Available Actions

### askClaudeAiMessagesApi

Send messages to Claude AI and receive responses using the Messages API.

#### Signature

```typescript
function* askClaudeAiMessagesApi(
  body: Anthropic.Messages.MessageCreateParamsNonStreaming,
  apiKey: string
): Generator<ClaudeAiMessagesApiAction, Anthropic.Message, any>
```

#### Parameters

- **body** (`MessageCreateParamsNonStreaming`): The message configuration object containing:
  - `model`: The Claude model to use (e.g., 'claude-3-opus-20240229', 'claude-3-sonnet-20240229')
  - `messages`: Array of message objects with role and content
  - `max_tokens`: Maximum tokens in the response
  - `temperature`: Controls randomness (0-1)
  - `system`: Optional system prompt
  - `metadata`: Optional metadata for the request
  - `stop_sequences`: Optional array of sequences that stop generation
  - `stream`: Must be false (streaming not supported in this action)

- **apiKey** (`string`): Your Anthropic API key for authentication

#### Returns

Returns an `Anthropic.Message` object containing:
- `id`: Unique message ID
- `type`: Message type (always 'message')
- `role`: Always 'assistant' for responses
- `content`: Array of content blocks (text, tool_use, etc.)
- `model`: The model that generated the response
- `stop_reason`: Why generation stopped
- `stop_sequence`: The sequence that stopped generation (if any)
- `usage`: Token usage statistics

#### Example Usage

##### Basic Text Generation

```typescript
import { askClaudeAiMessagesApi } from 'quidproquo-core';

function* generateProductDescription(productName: string, features: string[]) {
  const response = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Write a compelling product description for ${productName} with these features: ${features.join(', ')}`
        }
      ]
    },
    process.env.ANTHROPIC_API_KEY!
  );
  
  // Extract text from response
  const description = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';
    
  return description;
}
```

##### Conversational AI

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function* continueConversation(
  history: ChatMessage[],
  userMessage: string
) {
  // Build conversation history
  const messages = [
    ...history,
    { role: 'user' as const, content: userMessage }
  ];
  
  const response = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: 'You are a helpful assistant for a software development team.',
      messages
    },
    process.env.ANTHROPIC_API_KEY!
  );
  
  // Extract assistant's response
  const assistantMessage = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');
  
  return {
    history: [
      ...history,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage }
    ],
    response: assistantMessage
  };
}
```

##### Code Analysis

```typescript
function* analyzeCode(code: string, language: string) {
  const response = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.2, // Lower temperature for more focused analysis
      messages: [
        {
          role: 'user',
          content: `Analyze this ${language} code and provide:
1. A brief summary of what it does
2. Any potential bugs or issues
3. Suggestions for improvement
4. Security considerations

Code:
\`\`\`${language}
${code}
\`\`\``
        }
      ]
    },
    process.env.ANTHROPIC_API_KEY!
  );
  
  return response.content[0].text;
}
```

##### Content Moderation

```typescript
function* moderateContent(content: string) {
  const response = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-haiku-20240307', // Faster, cheaper model for moderation
      max_tokens: 100,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `Analyze this content for inappropriate material. 
          Respond with JSON: {"safe": boolean, "reason": string}
          
          Content: ${content}`
        }
      ]
    },
    process.env.ANTHROPIC_API_KEY!
  );
  
  try {
    const result = JSON.parse(response.content[0].text);
    return result;
  } catch {
    // Handle parsing error
    yield* askThrowError('MODERATION_ERROR', 'Failed to parse moderation response');
  }
}
```

## Configuration

### Setting Up API Keys

Store your Anthropic API key securely:

```typescript
// In configuration
import { defineSecret } from 'quidproquo-core';

export default [
  defineSecret('anthropic-api-key', {
    description: 'Anthropic API key for Claude AI'
  })
];

// In your story
function* aiStory() {
  const apiKey = yield* askConfigGetSecret('anthropic-api-key');
  const response = yield* askClaudeAiMessagesApi(body, apiKey);
}
```

### Model Selection

Choose the appropriate model for your use case:

```typescript
const CLAUDE_MODELS = {
  // Most capable, best for complex tasks
  OPUS: 'claude-3-opus-20240229',
  
  // Balanced performance and cost
  SONNET: 'claude-3-sonnet-20240229',
  
  // Fast and cost-effective
  HAIKU: 'claude-3-haiku-20240307',
  
  // Legacy models
  CLAUDE_2_1: 'claude-2.1',
  CLAUDE_2_0: 'claude-2.0',
  CLAUDE_INSTANT: 'claude-instant-1.2'
};
```

## Advanced Usage

### Structured Output

```typescript
function* extractStructuredData(text: string) {
  const response = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      temperature: 0,
      system: 'Extract information and respond only with valid JSON.',
      messages: [
        {
          role: 'user',
          content: `Extract the following from this text:
          - Name
          - Email
          - Phone
          - Address
          
          Text: ${text}
          
          Respond with JSON only.`
        }
      ]
    },
    apiKey
  );
  
  const jsonStr = response.content[0].text;
  return JSON.parse(jsonStr);
}
```

### Multi-turn Reasoning

```typescript
function* complexReasoning(problem: string) {
  const messages = [];
  
  // Step 1: Break down the problem
  messages.push({ role: 'user', content: `Break down this problem into steps: ${problem}` });
  const breakdown = yield* askClaudeAiMessagesApi(
    { model: 'claude-3-opus-20240229', max_tokens: 1000, messages },
    apiKey
  );
  messages.push({ role: 'assistant', content: breakdown.content[0].text });
  
  // Step 2: Solve each step
  messages.push({ role: 'user', content: 'Now solve each step you identified.' });
  const solution = yield* askClaudeAiMessagesApi(
    { model: 'claude-3-opus-20240229', max_tokens: 2000, messages },
    apiKey
  );
  messages.push({ role: 'assistant', content: solution.content[0].text });
  
  // Step 3: Verify the solution
  messages.push({ role: 'user', content: 'Double-check your solution and identify any errors.' });
  const verification = yield* askClaudeAiMessagesApi(
    { model: 'claude-3-opus-20240229', max_tokens: 1000, messages },
    apiKey
  );
  
  return {
    breakdown: breakdown.content[0].text,
    solution: solution.content[0].text,
    verification: verification.content[0].text
  };
}
```

### Rate Limiting and Retries

```typescript
import { askRetry, askDelay } from 'quidproquo-core';

function* aiRequestWithRetry(body: any, apiKey: string) {
  return yield* askRetry(
    function* () {
      try {
        return yield* askClaudeAiMessagesApi(body, apiKey);
      } catch (error) {
        // Check if rate limited
        if (error.status === 429) {
          // Wait before retry
          yield* askDelay(5000);
          throw error;
        }
        throw error;
      }
    },
    3, // Max retries
    5000 // Delay between retries
  );
}
```

## Error Handling

### Common Errors

```typescript
function* safeAiCall(body: any, apiKey: string) {
  const result = yield* askCatch(
    askClaudeAiMessagesApi(body, apiKey)
  );
  
  if (!result.success) {
    const error = result.error;
    
    switch (error.errorType) {
      case 'InvalidRequestError':
        // Invalid parameters
        yield* askLogCreate('ERROR', 'Invalid request parameters');
        return null;
        
      case 'AuthenticationError':
        // Invalid API key
        yield* askLogCreate('ERROR', 'Invalid API key');
        return null;
        
      case 'RateLimitError':
        // Rate limited
        yield* askLogCreate('WARN', 'Rate limited, retry later');
        return null;
        
      case 'APIError':
        // API error
        yield* askLogCreate('ERROR', 'Claude API error');
        return null;
        
      default:
        // Unknown error
        yield* askLogCreate('ERROR', `Unknown error: ${error.errorText}`);
        return null;
    }
  }
  
  return result.result;
}
```

## Best Practices

### 1. Use System Prompts

```typescript
const response = yield* askClaudeAiMessagesApi(
  {
    model: 'claude-3-sonnet-20240229',
    system: `You are an expert software architect. 
             Provide detailed, technically accurate responses.
             Use examples where appropriate.`,
    messages: [{ role: 'user', content: userQuery }],
    max_tokens: 2000
  },
  apiKey
);
```

### 2. Optimize Token Usage

```typescript
function* optimizedQuery(longText: string) {
  // Truncate or summarize long inputs
  const truncated = longText.length > 10000 
    ? longText.substring(0, 10000) + '...[truncated]'
    : longText;
  
  // Use appropriate max_tokens
  const response = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-haiku-20240307', // Use faster model for simple tasks
      messages: [{ role: 'user', content: `Summarize: ${truncated}` }],
      max_tokens: 200 // Limit response length
    },
    apiKey
  );
  
  return response;
}
```

### 3. Cache Responses

```typescript
function* cachedAiQuery(query: string, cacheKey: string) {
  // Check cache first
  const cached = yield* askKeyValueStoreGet('ai-cache', cacheKey);
  if (cached && cached.timestamp > Date.now() - 3600000) {
    return cached.response;
  }
  
  // Make AI call
  const response = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-sonnet-20240229',
      messages: [{ role: 'user', content: query }],
      max_tokens: 1000
    },
    apiKey
  );
  
  // Cache response
  yield* askKeyValueStoreUpsert('ai-cache', {
    key: cacheKey,
    response: response.content[0].text,
    timestamp: Date.now()
  });
  
  return response.content[0].text;
}
```

### 4. Validate Responses

```typescript
function* getStructuredResponse(prompt: string) {
  const response = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-sonnet-20240229',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    },
    apiKey
  );
  
  // Validate response format
  const text = response.content[0].text;
  
  // Try to parse as JSON
  try {
    const parsed = JSON.parse(text);
    // Validate schema
    if (!parsed.field1 || !parsed.field2) {
      yield* askThrowError('INVALID_RESPONSE', 'Missing required fields');
    }
    return parsed;
  } catch {
    yield* askThrowError('PARSE_ERROR', 'Failed to parse AI response');
  }
}
```

## Integration Examples

### With User Input

```typescript
function* handleUserQuery(userId: string, query: string) {
  // Log user query
  yield* askLogCreate('INFO', `User ${userId} query: ${query}`);
  
  // Get user context
  const userProfile = yield* askKeyValueStoreGet('users', userId);
  
  // Build contextual prompt
  const response = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-sonnet-20240229',
      system: `User context: ${JSON.stringify(userProfile)}`,
      messages: [{ role: 'user', content: query }],
      max_tokens: 1000
    },
    apiKey
  );
  
  // Store interaction
  yield* askKeyValueStoreUpsert('interactions', {
    userId,
    query,
    response: response.content[0].text,
    timestamp: yield* askDateNow()
  });
  
  return response.content[0].text;
}
```

### With File Processing

```typescript
function* analyzeDocument(documentPath: string) {
  // Read document
  const content = yield* askFileReadTextContents('documents', documentPath);
  
  // Analyze with AI
  const analysis = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-3-opus-20240229',
      messages: [
        {
          role: 'user',
          content: `Analyze this document and provide:
          1. Summary
          2. Key points
          3. Action items
          
          Document:
          ${content}`
        }
      ],
      max_tokens: 2000
    },
    apiKey
  );
  
  // Save analysis
  yield* askFileWriteTextContents(
    'analyses',
    `${documentPath}.analysis.txt`,
    analysis.content[0].text
  );
  
  return analysis.content[0].text;
}
```

## Platform-Specific Implementations

The Claude AI actions work across all platforms with internet access:

- **AWS Lambda**: Direct HTTPS calls to Anthropic API
- **Node.js**: Uses native fetch or axios
- **Browser**: Requires CORS proxy or backend API
- **Edge Functions**: Compatible with Cloudflare Workers, Vercel Edge

## Testing

### Unit Testing

```typescript
test('generates product description', () => {
  const story = generateProductDescription('Widget', ['Fast', 'Reliable']);
  
  // First yield: AI call
  const { value: aiAction } = story.next();
  expect(aiAction.type).toBe('ClaudeAi::MessagesApi');
  expect(aiAction.payload.body.messages[0].content).toContain('Widget');
  
  // Mock AI response
  const mockResponse = {
    content: [{ type: 'text', text: 'Amazing Widget description...' }]
  };
  
  const { value: result } = story.next(mockResponse);
  expect(result).toBe('Amazing Widget description...');
});
```

### Integration Testing

```typescript
test('AI conversation flow', async () => {
  const runtime = createTestRuntime({
    processors: {
      'ClaudeAi::MessagesApi': async (payload) => {
        // Mock different responses based on input
        if (payload.body.messages[0].content.includes('hello')) {
          return [{
            content: [{ type: 'text', text: 'Hello! How can I help?' }]
          }, undefined];
        }
        return [{
          content: [{ type: 'text', text: 'Generic response' }]
        }, undefined];
      }
    }
  });
  
  const result = await runtime.execute(
    continueConversation,
    [[], 'hello']
  );
  
  expect(result.response).toContain('Hello');
});
```

## Monitoring and Observability

```typescript
function* monitoredAiCall(body: any) {
  const startTime = yield* askDateNow();
  
  try {
    const response = yield* askClaudeAiMessagesApi(body, apiKey);
    
    // Log success metrics
    const endTime = yield* askDateNow();
    yield* askEventBusSendMessage('ai-metrics', {
      model: body.model,
      duration: endTime - startTime,
      inputTokens: body.messages.reduce((acc, m) => acc + m.content.length, 0),
      outputTokens: response.usage.output_tokens,
      success: true
    });
    
    return response;
  } catch (error) {
    // Log error metrics
    yield* askEventBusSendMessage('ai-metrics', {
      model: body.model,
      error: error.errorType,
      success: false
    });
    throw error;
  }
}
```

## Related Actions

- **Network Actions** - For custom API integrations
- **Config Actions** - For managing API keys
- **Log Actions** - For logging AI interactions
- **KeyValueStore Actions** - For caching responses